import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService } from 'app/shared/helpers';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { MerchantApiService } from '../../services';
import { MerchantActions } from '../actions';

@Injectable()
export class MerchantEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    fetchStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MerchantActions.fetchStoreRequest),
            map(action => action.payload),
            switchMap(queryParams => {
                return this.merchantApiSvc.findById(queryParams).pipe(
                    catchOffline(),
                    map(merchant => {
                        const newResponse = new Merchant(merchant);

                        this.logSvc.generateGroup('[FETCH RESPONSE MERCHANT REQUEST] ONLINE', {
                            payload: {
                                type: 'log',
                                value: newResponse
                            }
                        });

                        return MerchantActions.fetchStoreSuccess({
                            payload: {
                                merchant: newResponse,
                                source: 'fetch'
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            MerchantActions.fetchStoreFailure({
                                payload: {
                                    id: 'fetchStoreFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchStoresRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MerchantActions.fetchStoresRequest),
            withLatestFrom(this.authStore.select(AuthSelectors.getUserSupplier)),
            map(([{ payload }, { supplierId }]) => ({ ...payload, supplierId } as IQueryParams)),
            switchMap(queryParams => {
                return this.merchantApiSvc.find(queryParams).pipe(
                    catchOffline(),
                    map(resp => {
                        let newResp = {
                            total: 0,
                            data: []
                        };

                        if (queryParams.paginate) {
                            const newResponse = resp as IPaginatedResponse<Merchant>;

                            newResp = {
                                total: newResponse.total,
                                data: newResponse.data.map(merchant => new Merchant(merchant))
                            };
                        } else {
                            const newResponse = resp as Array<Merchant>;

                            newResp = {
                                total: newResponse.length,
                                data: newResponse.map(merchant => new Merchant(merchant))
                            };
                        }

                        this.logSvc.generateGroup('[FETCH RESPONSE MERCHANTS REQUEST] ONLINE', {
                            payload: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return MerchantActions.fetchStoresSuccess({
                            payload: {
                                merchants: newResp.data,
                                total: newResp.total,
                                source: 'fetch'
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            MerchantActions.fetchStoresFailure({
                                payload: {
                                    id: 'fetchStoresFailure',
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
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private merchantApiSvc: MerchantApiService,
        private logSvc: LogService
    ) {}
}
