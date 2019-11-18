import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { Account } from 'app/main/pages/accounts/models';
import { AccountApiService } from 'app/main/pages/accounts/services';
import { RoleApiService } from 'app/main/pages/roles/role-api.service';
import { Role } from 'app/main/pages/roles/role.model';
import {
    LogService,
    ProvinceApiService,
    StoreClusterApiService,
    StoreGroupApiService,
    StoreSegmentApiService,
    StoreTypeApiService,
    VehicleAccessibilityApiService
} from 'app/shared/helpers';
import {
    Province,
    StoreCluster,
    StoreGroup,
    StoreSegment,
    StoreType,
    VehicleAccessibility
} from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';
import { of } from 'rxjs';
import { catchError, concatMap, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { DropdownActions, NetworkActions } from '../actions';
import { NetworkSelectors } from '../selectors';

/**
 *
 *
 * @export
 * @class DropdownEffects
 */
@Injectable()
export class DropdownEffects {
    private _isOnline = this.network.online;

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Role]
    // -----------------------------------------------------------------------------------------------------

    fetchRoleDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownRoleRequest),
            // concatMap(payload =>
            //     of(payload).pipe(
            //         tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
            //     )
            // ),
            // withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            switchMap(_ => {
                if (this._isOnline) {
                    this._$log.generateGroup('[FETCH DROPDOWN ROLE REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: this._isOnline
                        }
                    });
                }

                return this._$roleApi.findAll({ paginate: false }).pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => (!resp['data'] ? (resp as Role[]) : null)),
                    map(resp => {
                        this._$log.generateGroup('[FETCH RESPONSE DROPDOWN ROLE] ONLINE', {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return DropdownActions.fetchDropdownRoleSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownRoleFailure({
                                payload: {
                                    id: 'fetchDropdownRoleFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchRoleDropdownByTypeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownRoleByTypeRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$roleApi
                    .findByRoleType(payload, {
                        paginate: false
                    })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            this._$log.generateGroup(
                                '[FETCH RESPONSE DROPDOWN ROLE BY TYPE] ONLINE',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                }
                            );

                            return DropdownActions.fetchDropdownRoleSuccess({ payload: resp });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchDropdownRoleFailure({
                                    payload: {
                                        id: 'fetchDropdownRoleByTypeFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Province]
    // -----------------------------------------------------------------------------------------------------

    fetchProvinceDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownProvinceRequest),
            switchMap(() => {
                return this._$provinceApi.findAllDropdown({ paginate: false }).pipe(
                    catchOffline(),
                    map(resp => {
                        return DropdownActions.fetchDropdownProvinceSuccess({
                            payload: [
                                ...resp.map(row => {
                                    return {
                                        ...new Province(
                                            row.id,
                                            row.name,
                                            row.urbans,
                                            row.createdAt,
                                            row.updatedAt,
                                            row.deletedAt
                                        )
                                    };
                                })
                            ]
                        });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownProvinceFailure({
                                payload: { id: 'fetchDropdownProvinceFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Store Cluster]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreClusterDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownStoreClusterRequest),
            switchMap(() =>
                this._$storeClusterApi.findAllDropdown({ paginate: false }).pipe(
                    catchOffline(),
                    map(resp =>
                        DropdownActions.fetchDropdownStoreClusterSuccess({
                            payload:
                                resp && resp.length > 0
                                    ? [
                                          ...resp.map(row => {
                                              return {
                                                  ...new StoreCluster(
                                                      row.name,
                                                      row.createdAt,
                                                      row.updatedAt,
                                                      row.deletedAt,
                                                      row.id
                                                  )
                                              };
                                          })
                                      ]
                                    : resp
                        })
                    ),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownStoreClusterFailure({
                                payload: { id: 'fetchDropdownStoreClusterFailure', errors: err }
                            })
                        )
                    )
                )
            )
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Store Group]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreGroupDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownStoreGroupRequest),
            switchMap(() =>
                this._$storeGroupApi.findAllDropdown({ paginate: false }).pipe(
                    catchOffline(),
                    map(resp =>
                        DropdownActions.fetchDropdownStoreGroupSuccess({
                            payload:
                                resp && resp.length > 0
                                    ? [
                                          ...resp.map(row => {
                                              return {
                                                  ...new StoreGroup(
                                                      row.name,
                                                      row.createdAt,
                                                      row.updatedAt,
                                                      row.deletedAt,
                                                      row.id
                                                  )
                                              };
                                          })
                                      ]
                                    : resp
                        })
                    ),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownStoreGroupFailure({
                                payload: { id: 'fetchDropdownStoreGroupFailure', errors: err }
                            })
                        )
                    )
                )
            )
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Store Segment]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreSegmentDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownStoreSegmentRequest),
            switchMap(() =>
                this._$storeSegmentApi.findAllDropdown({ paginate: false }).pipe(
                    catchOffline(),
                    map(resp =>
                        DropdownActions.fetchDropdownStoreSegmentSuccess({
                            payload:
                                resp && resp.length > 0
                                    ? [
                                          ...resp.map(row => {
                                              return {
                                                  ...new StoreSegment(
                                                      row.name,
                                                      row.createdAt,
                                                      row.updatedAt,
                                                      row.deletedAt,
                                                      row.id
                                                  )
                                              };
                                          })
                                      ]
                                    : resp
                        })
                    ),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownStoreSegmentFailure({
                                payload: { id: 'fetchDropdownStoreSegmentFailure', errors: err }
                            })
                        )
                    )
                )
            )
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Store Type]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreTypeDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownStoreTypeRequest),
            switchMap(() =>
                this._$storeTypeApi.findAllDropdown({ paginate: false }).pipe(
                    catchOffline(),
                    map(resp =>
                        DropdownActions.fetchDropdownStoreTypeSuccess({
                            payload:
                                resp && resp.length > 0
                                    ? [
                                          ...resp.map(row => {
                                              return {
                                                  ...new StoreType(
                                                      row.name,
                                                      row.createdAt,
                                                      row.updatedAt,
                                                      row.deletedAt,
                                                      row.id
                                                  )
                                              };
                                          })
                                      ]
                                    : resp
                        })
                    ),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownStoreTypeFailure({
                                payload: { id: 'fetchDropdownStoreTypeFailure', errors: err }
                            })
                        )
                    )
                )
            )
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Vehicle Accessibility]
    // -----------------------------------------------------------------------------------------------------

    fetchVehicleAccessibilityDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownVehicleAccessibilityRequest),
            switchMap(() =>
                this._$vehicleAccessibilityApi.findAllDropdown({ paginate: false }).pipe(
                    catchOffline(),
                    map(resp =>
                        DropdownActions.fetchDropdownVehicleAccessibilitySuccess({
                            payload:
                                resp && resp.length > 0
                                    ? [
                                          ...resp.map(row => {
                                              return {
                                                  ...new VehicleAccessibility(
                                                      row.name,
                                                      row.createdAt,
                                                      row.updatedAt,
                                                      row.deletedAt,
                                                      row.id
                                                  )
                                              };
                                          })
                                      ]
                                    : resp
                        })
                    ),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownVehicleAccessibilityFailure({
                                payload: {
                                    id: 'fetchDropdownVehicleAccessibilityFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                )
            )
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH search methods
    // -----------------------------------------------------------------------------------------------------

    fetchAccountSearchRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchSearchAccountRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            switchMap(([payload, isOnline]) => {
                if (isOnline) {
                    this._$log.generateGroup('[FETCH SEARCH ACCOUNT REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: isOnline
                        },
                        payload: {
                            type: 'log',
                            value: payload
                        }
                    });

                    return this._$accountApi.searchBy(payload).pipe(
                        catchOffline(),
                        map(resp => {
                            this._$log.generateGroup('[FETCH RESPONSE SEARCH ACCOUNT] ONLINE', {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            const newResp =
                                resp && resp.length > 0
                                    ? [
                                          ...resp.map(account => {
                                              return {
                                                  ...new Account(
                                                      account.id,
                                                      account.fullName,
                                                      account.email,
                                                      account.phoneNo,
                                                      account.mobilePhoneNo,
                                                      account.idNo,
                                                      account.taxNo,
                                                      account.status,
                                                      account.imageUrl,
                                                      account.taxImageUrl,
                                                      account.idImageUrl,
                                                      account.selfieImageUrl,
                                                      account.urbanId,
                                                      account.userStores,
                                                      account.userSuppliers,
                                                      account.roles,
                                                      account.urban,
                                                      account.createdAt,
                                                      account.updatedAt,
                                                      account.deletedAt
                                                  )
                                              };
                                          })
                                      ]
                                    : [];

                            return DropdownActions.fetchSearchAccountSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchSearchAccountFailure({
                                    payload: {
                                        id: 'fetchAccountSearchFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                }

                this._$log.generateGroup('[FETCH SEARCH ACCOUNT REQUEST] OFFLINE', {
                    online: {
                        type: 'log',
                        value: isOnline
                    },
                    payload: {
                        type: 'log',
                        value: payload
                    }
                });

                return of(
                    DropdownActions.fetchSearchAccountFailure({
                        payload: {
                            id: 'fetchAccountSearchFailure',
                            errors: 'Offline'
                        }
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private store: Store<fromRoot.State>,
        protected network: Network,
        private _$accountApi: AccountApiService,
        private _$log: LogService,
        private _$provinceApi: ProvinceApiService,
        private _$roleApi: RoleApiService,
        private _$storeClusterApi: StoreClusterApiService,
        private _$storeGroupApi: StoreGroupApiService,
        private _$storeSegmentApi: StoreSegmentApiService,
        private _$storeTypeApi: StoreTypeApiService,
        private _$vehicleAccessibilityApi: VehicleAccessibilityApiService
    ) {}
}
