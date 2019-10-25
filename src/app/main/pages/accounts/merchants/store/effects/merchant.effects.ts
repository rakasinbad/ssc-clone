import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Network, catchOffline } from '@ngx-pwa/offline';

import { MerchantApiService } from '../../services';
import { fromMerchant } from '../reducers';
import { BrandStoreActions } from '../actions';
import { map, withLatestFrom, switchMap, catchError } from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of } from 'rxjs';
import { BrandStore } from '../../models';

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

    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<fromMerchant.FeatureState>,
        protected network: Network,
        private _$merchantApi: MerchantApiService
    ) {}
}
