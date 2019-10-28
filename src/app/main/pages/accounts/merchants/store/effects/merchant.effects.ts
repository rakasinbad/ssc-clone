import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { BrandStore } from '../../models';
import { MerchantApiService } from '../../services';
import { BrandStoreActions } from '../actions';
import { fromMerchant } from '../reducers';

@Injectable()
export class MerchantEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    fetchBrandStoresRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.fetchBrandStoresRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            switchMap(([payload, auth]) => {
                if (!auth.user.data.userBrands.length) {
                    return of(
                        BrandStoreActions.fetchBrandStoresFailure({
                            payload: { id: 'fetchBrandStoresFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$merchantApi
                    .findAll(payload, auth.user.data.userBrands[0].brandId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            let newResp = {
                                total: 0,
                                data: []
                            };

                            if (resp.total > 0) {
                                newResp = {
                                    total: resp.total,
                                    data: [
                                        ...resp.data.map(brandStore => {
                                            return {
                                                ...new BrandStore(
                                                    brandStore.id,
                                                    brandStore.brandId,
                                                    brandStore.storeId,
                                                    brandStore.status,
                                                    brandStore.store,
                                                    brandStore.createdAt,
                                                    brandStore.updatedAt,
                                                    brandStore.deletedAt
                                                )
                                            };
                                        })
                                    ]
                                };
                            }

                            return BrandStoreActions.fetchBrandStoresSuccess({
                                payload: { brandStores: newResp.data, total: newResp.total }
                            });
                        }),
                        catchError(err =>
                            of(
                                BrandStoreActions.fetchBrandStoresFailure({
                                    payload: { id: 'fetchBrandStoresFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchBrandStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.fetchBrandStoreRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$merchantApi.findById(id).pipe(
                    catchOffline(),
                    map(resp =>
                        BrandStoreActions.fetchBrandStoreSuccess({
                            payload: {
                                brandStore: {
                                    ...new BrandStore(
                                        resp.id,
                                        resp.brandId,
                                        resp.storeId,
                                        resp.status,
                                        resp.store,
                                        resp.createdAt,
                                        resp.updatedAt,
                                        resp.deletedAt
                                    )
                                },
                                source: 'fetch'
                            }
                        })
                    ),
                    catchError(err =>
                        of(
                            BrandStoreActions.fetchBrandStoreFailure({
                                payload: {
                                    id: 'fetchBrandStoreFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<fromMerchant.FeatureState>,
        protected network: Network,
        private _$merchantApi: MerchantApiService
    ) {}
}
