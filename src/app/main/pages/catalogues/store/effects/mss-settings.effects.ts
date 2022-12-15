import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { CatalogueMssSettingsActions, CatalogueActions } from '../actions';
import { CatalogueMssSettingsService } from './../../services';
import { NoticeService, HelperService } from 'app/shared/helpers';
import { fromCatalogue } from '../reducers';

@Injectable()
export class MssSettingsEffects {
    readonly fetchCatalogueMssSettingsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueMssSettingsActions.fetchRequest),
            map((action) => action.queryParams),
            mergeMap((queryParams) => 
                this.catalogueMssSettingsService.fetchCatalogueMssSettingsRequest$(queryParams) 
            )
        )
    );
    
    readonly upsertCatalogueMssSettingsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueMssSettingsActions.upsertRequest),
            map((action) => action.payload),
            mergeMap((payload) => 
                this.catalogueMssSettingsService.upsertCatalogueMssSettingsRequest$(payload) 
            )
        )
    );

    readonly upsertCatalogueMssSettingsSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueMssSettingsActions.upsertSuccess),
                map((action) => action.data),
                tap((data) => {
                    this._$notice.open('Produk berhasil di-update', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });

                    this.store.dispatch(CatalogueActions.setRefreshStatus({ status: true }));
                })
            ),
        { dispatch: false }
    );

    readonly upsertCatalogueMssSettingsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueMssSettingsActions.upsertFailure),
                map((action) => action.payload),
                tap((payload) => {
                    this.store.dispatch(CatalogueActions.setRefreshStatus({ status: true }));
                    this.helper$.showErrorNotification(payload);
                })
            ),
        { dispatch: false }
    );


    readonly fetchCatalogueMssSettingsSegmentationRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueMssSettingsActions.fetchSegmentationsRequest),
            map((action) => action.queryParams),
            mergeMap((queryParams) => 
                this.catalogueMssSettingsService.fetchCatalogueMssSettingsSegmentationRequest$(queryParams) 
            )
        )
    );

    readonly fetchMssBaseRequest$ = createEffect(() =>
    this.actions$.pipe(
        ofType(CatalogueMssSettingsActions.fetchMssBaseRequest),
        mergeMap(({ supplierId, queryParams}) => {
            return this.catalogueMssSettingsService.fetchMssBaseRequest$(supplierId, queryParams) 
        })
    )
);

    constructor(
        private readonly actions$: Actions,
        private readonly catalogueMssSettingsService: CatalogueMssSettingsService,
        private _$notice: NoticeService,
        private store: Store<fromCatalogue.FeatureState>,
        private helper$: HelperService,
    ) {}
}
