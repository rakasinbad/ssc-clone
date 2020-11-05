import { DeleteCatalogueSegmentationsComponent } from 'app/shared/modals';
import { MatDialog } from '@angular/material';
import { map, exhaustMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CatalogueSegmentationActions } from '../actions';

@Injectable()
export class CatalogueSegmentationsEffects {
    constructor(private actions$: Actions, private matDialog: MatDialog) { }
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

                    console.log('fghfgh');

                    return dialogRef.afterClosed();
                }),
                map(response => {
                    console.log('CONFIRM SET TO INACTIVE', response);


                })
            ),
        { dispatch: false }
    );
}
