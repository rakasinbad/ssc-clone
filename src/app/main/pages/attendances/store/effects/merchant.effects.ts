import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { LogService } from 'app/shared/helpers';
import { NetworkActions } from 'app/shared/store/actions';
import { NetworkSelectors } from 'app/shared/store/selectors';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { IPaginatedResponse, IQueryParams } from 'app/shared/models';

import { Store as Merchant } from '../../models';
import { MerchantApiService } from '../../services';
import { MerchantActions } from '../actions';
import { fromMerchant } from '../reducers';

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
                        const newResponse = new Merchant(
                            merchant.id,
                            merchant.storeCode,
                            merchant.name,
                            merchant.address,
                            merchant.taxNo,
                            merchant.longitude,
                            merchant.latitude,
                            merchant.largeArea,
                            merchant.phoneNo,
                            merchant.imageUrl,
                            merchant.taxImageUrl,
                            merchant.status,
                            merchant.reason,
                            merchant.parent,
                            merchant.parentId,
                            merchant.numberOfEmployee,
                            merchant.externalId,
                            merchant.storeTypeId,
                            merchant.storeGroupId,
                            merchant.storeSegmentId,
                            merchant.urbanId,
                            merchant.vehicleAccessibilityId,
                            merchant.warehouseId,
                            merchant.userStores,
                            merchant.storeType,
                            merchant.storeGroup,
                            merchant.storeSegment,
                            merchant.urban,
                            merchant.storeConfig,
                            merchant.createdAt,
                            merchant.updatedAt,
                            merchant.deletedAt
                        );

                        this.logSvc.generateGroup(
                            '[FETCH RESPONSE MERCHANT REQUEST] ONLINE',
                            {
                                payload: {
                                    type: 'log',
                                    value: newResponse
                                }
                            }
                        );

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
            map(action => action.payload),
            switchMap(queryParams => {
                return this.merchantApiSvc.find(queryParams).pipe(
                    catchOffline(),
                    map(resp => {
                        let newResp = {
                            total: 0,
                            data: []
                        };

                        if (queryParams.paginate) {
                            const newResponse = (resp as IPaginatedResponse<Merchant>);

                            newResp = {
                                total: newResponse.total,
                                data: newResponse.data.map(merchant => new Merchant(
                                    merchant.id,
                                    merchant.storeCode,
                                    merchant.name,
                                    merchant.address,
                                    merchant.taxNo,
                                    merchant.longitude,
                                    merchant.latitude,
                                    merchant.largeArea,
                                    merchant.phoneNo,
                                    merchant.imageUrl,
                                    merchant.taxImageUrl,
                                    merchant.status,
                                    merchant.reason,
                                    merchant.parent,
                                    merchant.parentId,
                                    merchant.numberOfEmployee,
                                    merchant.externalId,
                                    merchant.storeTypeId,
                                    merchant.storeGroupId,
                                    merchant.storeSegmentId,
                                    merchant.urbanId,
                                    merchant.vehicleAccessibilityId,
                                    merchant.warehouseId,
                                    merchant.userStores,
                                    merchant.storeType,
                                    merchant.storeGroup,
                                    merchant.storeSegment,
                                    merchant.urban,
                                    merchant.storeConfig,
                                    merchant.createdAt,
                                    merchant.updatedAt,
                                    merchant.deletedAt
                                ))
                            };
                        } else {
                            const newResponse = (resp as Array<Merchant>);

                            newResp = {
                                total: newResponse.length,
                                data: newResponse.map(merchant => new Merchant(
                                    merchant.id,
                                    merchant.storeCode,
                                    merchant.name,
                                    merchant.address,
                                    merchant.taxNo,
                                    merchant.longitude,
                                    merchant.latitude,
                                    merchant.largeArea,
                                    merchant.phoneNo,
                                    merchant.imageUrl,
                                    merchant.taxImageUrl,
                                    merchant.status,
                                    merchant.reason,
                                    merchant.parent,
                                    merchant.parentId,
                                    merchant.numberOfEmployee,
                                    merchant.externalId,
                                    merchant.storeTypeId,
                                    merchant.storeGroupId,
                                    merchant.storeSegmentId,
                                    merchant.urbanId,
                                    merchant.vehicleAccessibilityId,
                                    merchant.warehouseId,
                                    merchant.userStores,
                                    merchant.storeType,
                                    merchant.storeGroup,
                                    merchant.storeSegment,
                                    merchant.urban,
                                    merchant.storeConfig,
                                    merchant.createdAt,
                                    merchant.updatedAt,
                                    merchant.deletedAt
                                ))
                            };
                        }

                        this.logSvc.generateGroup(
                            '[FETCH RESPONSE MERCHANTS REQUEST] ONLINE',
                            {
                                payload: {
                                    type: 'log',
                                    value: resp
                                }
                            }
                        );

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
        private merchantApiSvc: MerchantApiService,
        private logSvc: LogService
    ) {}
}
