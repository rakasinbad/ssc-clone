import { CatalogueSegmentationFacadeService } from './../../services/catalogue-segmentation-facade.service';
import { CatalogueSegmentationDataSource } from './../../datasources/catalogue-segmentation.datasource';
import { Store } from '@ngrx/store';
import { DeleteCatalogueSegmentationsComponent } from 'app/shared/modals';
import { MatDialog} from '@angular/material';
import { map, exhaustMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UiActions } from 'app/shared/store/actions';
import { CatalogueSegmentationActions } from '../actions';
import { environment } from 'environments/environment';
import { fromCatalogueSegmentation } from '../reducers';

@Injectable()
export class CatalogueSegmentationsEffects {
    dataSource: CatalogueSegmentationDataSource;

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private dataService: CatalogueSegmentationFacadeService,
        private store: Store<fromCatalogueSegmentation.FeatureState>
    ) { }

    DeleteCatalogueSegmentationsSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueSegmentationActions.DeleteCatalogueSegmentationsSuccess),
                map(action => action.payload),
                exhaustMap(params => {
                    const dialogRef = this.matDialog.open(DeleteCatalogueSegmentationsComponent, {
                        data: {
                            title: 'Delete',
                            message: `This action only delete the linked segments, except the set <br>
                            warehouse segment setting. If you want remove the SKU <br>
                            completely from the linked warehouse segment setting, <br>
                            you should access it form the SKU assigment menu. <br>
                            Are you sure want to delete it?`,
                            id: params.id
                        },
                        disableClose: true
                    });

                    return dialogRef.afterClosed();
                }),
                map(response => {
                    //run action for refresh table
                    if (response) {
                        //call api from CatalogueSegmentationApiService
                        this.dataService.deleteWithQuery(response);
                    } else {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );
}
