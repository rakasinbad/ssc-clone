import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
// import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { BrandService } from '../../services/brand.service';
import { UiActions } from 'app/shared/store/actions';
// import { getParams } from 'app/store/app.reducer';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { of } from 'rxjs';
import {
    catchError,
    concatMap,
    exhaustMap,
    finalize,
    map,
    mergeMap,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { Catalogue, CatalogueCategory, CatalogueUnit, Brand } from '../../models';
import { CataloguesService } from '../../services';
import { CatalogueActions, BrandActions } from '../actions';
import { fromCatalogue, fromBrand } from '../reducers';
import { state } from '@angular/animations';

@Injectable()
export class BrandEffects {

    fetchBrandsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandActions.fetchBrandsRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$brandApi
                    .find<Array<Brand>>(payload)
                    .pipe(
                        catchOffline(),
                        map(response => {
                            const newResp = {
                                total: response.length,
                                data: response.map(res => new Brand(
                                    res.id,
                                    res.name,
                                    res.address,
                                    res.longitude,
                                    res.latitude,
                                    res.phoneNo,
                                    res.imageUrl,
                                    res.official,
                                    res.status,
                                    res.urbanId,
                                    res.createdAt,
                                    res.updatedAt,
                                    res.deletedAt,
                                ))
                            };

                            return BrandActions.fetchBrandsSuccess({
                                payload: { brands: newResp.data, total: newResp.total }
                            });
                        }),
                        catchError(err =>
                            of(
                                BrandActions.fetchBrandsFailure({
                                    payload: { id: 'fetchBrandsFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromBrand.FeatureState>,
        protected network: Network,
        private _$log: LogService,
        private _$brandApi: BrandService,
        private _$notice: NoticeService
    ) {}
}
