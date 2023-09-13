import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { CreditLimitGroup } from 'app/main/pages/finances/credit-limit-balance/models';
// import { CreditLimitGroupApiService } from 'app/main/pages/finances/credit-limit-balance/services';
import {
    ClusterApiService,
    DistrictApiService,
    HierarchyApiService,
    InvoiceGroupApiService,
    LocationSearchApiService,
    LogService,
    ProvinceApiService,
    StoreClusterApiService,
    StoreGroupApiService,
    StoreSegmentApiService,
    StoreTypeApiService,
    UrbanApiService,
    VehicleAccessibilityApiService
} from 'app/shared/helpers';
import { RoleApiService } from 'app/shared/helpers/role-api.service';
import { Cluster } from 'app/shared/models/cluster.model';
import { Hierarchy } from 'app/shared/models/customer-hierarchy.model';
import { PaginateResponse } from 'app/shared/models/global.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { District, IDistrict, Province, Urban } from 'app/shared/models/location.model';
import { Role } from 'app/shared/models/role.model';
import { StoreGroup } from 'app/shared/models/store-group.model';
import { StoreSegment } from 'app/shared/models/store-segment.model';
import { StoreType } from 'app/shared/models/store-type.model';
import { VehicleAccessibility } from 'app/shared/models/vehicle-accessibility.model';
import * as fromRoot from 'app/store/app.reducer';
import { sortBy } from 'lodash';
import { asyncScheduler, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    exhaustMap,
    map,
    retry,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import { DropdownActions } from '../actions';

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
    // @ FETCH location base google data methods [Location]
    // -----------------------------------------------------------------------------------------------------

    fetchLocationRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchLocationRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$locationSearchApi.findLocation<PaginateResponse<Urban>>(payload).pipe(
                    map(resp => {
                        const newResp =
                            resp && resp.data && resp.data.length > 0
                                ? resp.data.map(r => new Urban(r))[0]
                                : null;

                        return DropdownActions.fetchLocationSuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchLocationFailure({
                                payload: {
                                    id: 'fetchLocationFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    searchDistrictRequest$ = createEffect(
        () => ({ debounce = 300, scheduler = asyncScheduler } = {}) =>
            this.actions$.pipe(
                ofType(DropdownActions.searchDistrictRequest),
                debounceTime(debounce, scheduler),
                map(action => action.payload),
                map(params => DropdownActions.fetchDistrictRequest({ payload: params }))
            )
    );

    fetchDistrictRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDistrictRequest),
            map(action => action.payload),
            switchMap(params => {
                return this._$districtApi.findAll<PaginateResponse<IDistrict>>(params).pipe(
                    map(resp => {
                        const newResp = {
                            data:
                                resp && resp.data && resp.data.length > 0
                                    ? resp.data.map(row => new District(row))
                                    : [],
                            total: resp.total
                        };

                        return DropdownActions.fetchDistrictSuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDistrictFailure({
                                payload: { id: 'fetchDistrictFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchScrollDistrictRequest$ = createEffect(
        () => ({ debounce = 300, scheduler = asyncScheduler } = {}) =>
            this.actions$.pipe(
                ofType(DropdownActions.fetchScrollDistrictRequest),
                debounceTime(debounce, scheduler),
                map(action => action.payload),
                switchMap(params => {
                    return this._$districtApi.findAll<PaginateResponse<IDistrict>>(params).pipe(
                        map(resp => {
                            const newResp = {
                                data:
                                    resp && resp.data && resp.data.length > 0
                                        ? resp.data.map(row => new District(row))
                                        : [],
                                total: resp.total
                            };

                            return DropdownActions.fetchScrollDistrictSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchScrollDistrictFailure({
                                    payload: { id: 'fetchScrollDistrictFailure', errors: err }
                                })
                            )
                        )
                    );
                })
            )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Credit Limit Group]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Credit Limit Group
     * @memberof DropdownEffects
     */
    // fetchDropdownCreditLimitGroupRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(DropdownActions.fetchDropdownCreditLimitGroupRequest),
    //         withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
    //         switchMap(([_, { supplierId }]) => {
    //             if (!supplierId) {
    //                 return of(
    //                     DropdownActions.fetchDropdownCreditLimitGroupFailure({
    //                         payload: {
    //                             id: 'fetchDropdownCreditLimitGroupFailure',
    //                             errors: 'Not Found!'
    //                         }
    //                     })
    //                 );
    //             }

    //             return this._$creditLimitGroupApi
    //                 .findAll<Array<CreditLimitGroup>>({ paginate: false }, supplierId)
    //                 .pipe(
    //                     catchOffline(),
    //                     retry(3),
    //                     map(resp => {
    //                         const sources = resp.map(row => {
    //                             const newCreditLimitGroup = new CreditLimitGroup(row);

    //                             return newCreditLimitGroup;
    //                         });

    //                         return DropdownActions.fetchDropdownCreditLimitGroupSuccess({
    //                             payload: sortBy(sources, ['name'], ['asc'])
    //                         });
    //                     }),
    //                     catchError(err =>
    //                         of(
    //                             DropdownActions.fetchDropdownCreditLimitGroupFailure({
    //                                 payload: {
    //                                     id: 'fetchDropdownCreditLimitGroupFailure',
    //                                     errors: err
    //                                 }
    //                             })
    //                         )
    //                     )
    //                 );
    //         })
    //     )
    // );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Geo Parameter]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Geo Parameter Province
     * @memberof DropdownEffects
     */
    fetchDropdownGeoParameterProvinceRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownGeoParameterProvinceRequest),
            map(action => action.payload),
            switchMap(({ id, type }) => {
                return this._$provinceApi.findAll({ paginate: false }).pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => {
                        const sources = (resp as Array<Province>).map(row => {
                            const newProvince = new Province(row);

                            return newProvince.name;
                        });

                        return DropdownActions.fetchDropdownGeoParameterProvinceSuccess({
                            payload: { id, type, source: sortBy(sources).filter(v => !!v) }
                        });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownGeoParameterProvinceFailure({
                                payload: {
                                    id: 'fetchDropdownGeoParameterProvinceFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST] Geo Parameter City
     * @memberof DropdownEffects
     */
    fetchDropdownGeoParameterCityRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownGeoParameterCityRequest),
            map(action => action.payload),
            switchMap(({ id, type }) => {
                return this._$urbanApi.findAll({ paginate: false }, 'city').pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => {
                        const sources = (resp as Array<Urban>).map((row: Partial<Urban>) => {
                            return row.city;
                        });

                        return DropdownActions.fetchDropdownGeoParameterCitySuccess({
                            payload: { id, type, source: sortBy(sources).filter(v => !!v) }
                        });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownGeoParameterCityFailure({
                                payload: {
                                    id: 'fetchDropdownGeoParameterCityFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST] Geo Parameter District
     * @memberof DropdownEffects
     */
    fetchDropdownGeoParameterDistrictRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownGeoParameterDistrictRequest),
            map(action => action.payload),
            switchMap(({ id, type }) => {
                return this._$urbanApi.findAll({ paginate: false }, 'district').pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => {
                        const sources = (resp as Array<Urban>).map((row: Partial<Urban>) => {
                            return row.district;
                        });

                        return DropdownActions.fetchDropdownGeoParameterDistrictSuccess({
                            payload: { id, type, source: sortBy(sources).filter(v => !!v) }
                        });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownGeoParameterDistrictFailure({
                                payload: {
                                    id: 'fetchDropdownGeoParameterDistrictFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST] Geo Parameter Urban
     * @memberof DropdownEffects
     */
    fetchDropdownGeoParameterUrbanRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownGeoParameterUrbanRequest),
            map(action => action.payload),
            switchMap(({ id, type }) => {
                return this._$urbanApi.findAll({ paginate: false }, 'urban').pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => {
                        const sources = (resp as Array<Urban>).map((row: Partial<Urban>) => {
                            return row.urban;
                        });

                        return DropdownActions.fetchDropdownGeoParameterUrbanSuccess({
                            payload: { id, type, source: sortBy(sources).filter(v => !!v) }
                        });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownGeoParameterUrbanFailure({
                                payload: {
                                    id: 'fetchDropdownGeoParameterUrbanFailure',
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
    // @ FETCH dropdown methods [Hierarchy]
    // -----------------------------------------------------------------------------------------------------

    fetchDropdownHierarchyRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownHierarchyRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([_, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage.get('user').toPromise();
                }

                const { supplierId } = userSupplier;

                return of(supplierId);
            }),
            switchMap(data => {
                if (!data) {
                    return of(
                        DropdownActions.fetchDropdownHierarchyFailure({
                            payload: {
                                id: 'fetchDropdownHierarchyFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                let supplierId;

                if (typeof data === 'string') {
                    supplierId = data;
                } else {
                    supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                }

                return this._$hierarchyApi
                    .findAll<Hierarchy[]>({ paginate: false }, supplierId)
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            const newResp =
                                resp && resp.length > 0 ? resp.map(row => new Hierarchy(row)) : [];

                            return DropdownActions.fetchDropdownHierarchySuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchDropdownHierarchyFailure({
                                    payload: { id: 'fetchDropdownHierarchyFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Invoice Group]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Invoice Group
     * @memberof DropdownEffects
     */
    fetchDropdownInvoiceGroupRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownInvoiceGroupRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([_, userSupplier]) => {
                if (!userSupplier || !userSupplier.supplierId) {
                    return of(
                        DropdownActions.fetchDropdownInvoiceGroupFailure({
                            payload: {
                                id: 'fetchDropdownInvoiceGroupFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                const { supplierId } = userSupplier;

                return this._$invoiceGroupApi.findAll({ paginate: false }, supplierId).pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => {
                        const sources = (resp as Array<InvoiceGroup>).map(row => {
                            const newInvoiceGroup = new InvoiceGroup(row);

                            return newInvoiceGroup;
                        });

                        return DropdownActions.fetchDropdownInvoiceGroupSuccess({
                            payload: sortBy(sources, ['name'], ['asc'])
                        });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownInvoiceGroupFailure({
                                payload: { id: 'fetchDropdownInvoiceGroupFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Invoice Group] with warehouseId & supplierId
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Invoice Group with warehouseId & supplierId
     * @memberof DropdownEffects
     */
    fetchDropdownInvoiceGroupWhSupRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownInvoiceGroupWhSupRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([params, userSupplier]) => {
                if (!userSupplier || !userSupplier.supplierId) {
                    return of(
                        DropdownActions.fetchDropdownInvoiceGroupWhSupFailure({
                            payload: {
                                id: 'fetchDropdownInvoiceGroupWhSupFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                const { supplierId } = userSupplier;

                return this._$invoiceGroupApi.findByWhSupplier(params, supplierId).pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => {
                        const sources = (resp as Array<InvoiceGroup>).map(row => {
                            const newInvoiceGroup = new InvoiceGroup(row);

                            return newInvoiceGroup;
                        });

                        return DropdownActions.fetchDropdownInvoiceGroupSuccess({
                            payload: sortBy(sources, ['name'], ['asc'])
                        });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownInvoiceGroupFailure({
                                payload: { id: 'fetchDropdownInvoiceGroupFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );
    
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Role]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Dropdown Role
     * @memberof DropdownEffects
     */
    fetchRoleDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownRoleRequest),
            // concatMap(payload =>
            //     of(payload).pipe(
            //         tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
            //     )
            // ),
            // withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([_, payload]) => {
                if (this._isOnline) {
                    this._$log.generateGroup('[REQUEST FETCH DROPDOWN ROLE] ONLINE', {
                        online: {
                            type: 'log',
                            value: this._isOnline
                        }
                    });
                }

                return this._$roleApi
                    .findAll<Role[]>(payload.user.userSupplier.supplierId, { paginate: false })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        // map(resp => (!resp['data'] ? (resp as Role[]) : null)),
                        map(resp => {
                            const newResp =
                                resp && resp.length > 0 ? resp.map(row => new Role(row)) : [];

                            return DropdownActions.fetchDropdownRoleSuccess({ payload: newResp });
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

    // fetchRoleDropdownByTypeRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(DropdownActions.fetchDropdownRoleByTypeRequest),
    //         map(action => action.payload),
    //         switchMap(payload => {
    //             return this._$roleApi
    //                 .findByRoleType(payload, {
    //                     paginate: false
    //                 })
    //                 .pipe(
    //                     catchOffline(),
    //                     retry(3),
    //                     map(resp => {
    //                         this._$log.generateGroup(
    //                             '[FETCH RESPONSE DROPDOWN ROLE BY TYPE] ONLINE',
    //                             {
    //                                 response: {
    //                                     type: 'log',
    //                                     value: resp
    //                                 }
    //                             }
    //                         );

    //                         return DropdownActions.fetchDropdownRoleSuccess({ payload: resp });
    //                     }),
    //                     catchError(err =>
    //                         of(
    //                             DropdownActions.fetchDropdownRoleFailure({
    //                                 payload: {
    //                                     id: 'fetchDropdownRoleByTypeFailure',
    //                                     errors: err
    //                                 }
    //                             })
    //                         )
    //                     )
    //                 );
    //         })
    //     )
    // );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Province]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Dropdown Province
     * @memberof DropdownEffects
     */
    fetchProvinceDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownProvinceRequest),
            switchMap(() => {
                return this._$provinceApi.findAllDropdown({ paginate: false }).pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => {
                        const newResp =
                            resp && resp.length > 0 ? resp.map(row => new Province(row)) : [];

                        return DropdownActions.fetchDropdownProvinceSuccess({
                            payload: newResp
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

    /**
     *
     * [REQUEST] Dropdown Store Cluster
     * @memberof DropdownEffects
     */
    fetchStoreClusterDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownStoreClusterRequest),
            switchMap(() => {
                return this._$clusterApi
                    .findAll<Cluster[]>({ paginate: false })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            const newResp =
                                resp && resp.length > 0 ? resp.map(row => new Cluster(row)) : [];

                            return DropdownActions.fetchDropdownStoreClusterSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchDropdownStoreClusterFailure({
                                    payload: { id: 'fetchDropdownStoreClusterFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods [Store Group]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Dropdown Store Group
     * @memberof DropdownEffects
     */
    fetchStoreGroupDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownStoreGroupRequest),
            switchMap(() => {
                return this._$storeGroupApi
                    .findAll<StoreGroup[]>({ paginate: false })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            const newResp =
                                resp && resp.length > 0
                                    ? resp.map(row => {
                                          return new StoreGroup(
                                              row.id,
                                              row.name,
                                              row.createdAt,
                                              row.updatedAt,
                                              row.deletedAt
                                          );
                                      })
                                    : [];

                            return DropdownActions.fetchDropdownStoreGroupSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchDropdownStoreGroupFailure({
                                    payload: {
                                        id: 'fetchDropdownStoreGroupFailure',
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
    // @ FETCH dropdown methods [Store Segment]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Dropdown Store Segment
     * @memberof DropdownEffects
     */
    fetchStoreSegmentDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownStoreSegmentRequest),
            switchMap(() => {
                return this._$storeSegmentApi
                    .findAll<StoreSegment[]>({ paginate: false })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            const newResp =
                                resp && resp.length > 0
                                    ? resp.map(row => {
                                          return new StoreSegment(
                                              row.id,
                                              row.name,
                                              row.createdAt,
                                              row.updatedAt,
                                              row.deletedAt
                                          );
                                      })
                                    : [];

                            return DropdownActions.fetchDropdownStoreSegmentSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchDropdownStoreSegmentFailure({
                                    payload: {
                                        id: 'fetchDropdownStoreSegmentFailure',
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
    // @ FETCH dropdown methods [Store Type]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Dropdown Store Type
     * @memberof DropdownEffects
     */
    fetchStoreTypeDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownStoreTypeRequest),
            switchMap(() => {
                return this._$storeTypeApi
                    .findAll<StoreType[]>({ paginate: false })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            const newResp =
                                resp && resp.length > 0
                                    ? resp.map(row => {
                                          return new StoreType(
                                              row.id,
                                              row.name,
                                              row.createdAt,
                                              row.updatedAt,
                                              row.deletedAt
                                          );
                                      })
                                    : [];

                            return DropdownActions.fetchDropdownStoreTypeSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchDropdownStoreTypeFailure({
                                    payload: {
                                        id: 'fetchDropdownStoreTypeFailure',
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
    // @ FETCH dropdown methods [Vehicle Accessibility]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Dropdown Vehicle Accessibility
     * @memberof DropdownEffects
     */
    fetchVehicleAccessibilityDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownVehicleAccessibilityRequest),
            switchMap(() => {
                return this._$vehicleAccessibilityApi
                    .findAll<VehicleAccessibility[]>({ paginate: false })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            const newResp =
                                resp && resp.length > 0
                                    ? resp.map(row => {
                                          return new VehicleAccessibility(
                                              row.id,
                                              row.name,
                                              row.createdAt,
                                              row.updatedAt,
                                              row.deletedAt
                                          );
                                      })
                                    : [];

                            return DropdownActions.fetchDropdownVehicleAccessibilitySuccess({
                                payload: newResp
                            });
                        }),
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
                    );
            })
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH search methods
    // -----------------------------------------------------------------------------------------------------

    // fetchAccountSearchRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(DropdownActions.fetchSearchAccountRequest),
    //         map(action => action.payload),
    //         concatMap(payload =>
    //             of(payload).pipe(
    //                 tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
    //             )
    //         ),
    //         withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
    //         switchMap(([payload, isOnline]) => {
    //             if (isOnline) {
    //                 this._$log.generateGroup('[FETCH SEARCH ACCOUNT REQUEST] ONLINE', {
    //                     online: {
    //                         type: 'log',
    //                         value: isOnline
    //                     },
    //                     payload: {
    //                         type: 'log',
    //                         value: payload
    //                     }
    //                 });

    //                 return this._$accountApi.searchBy(payload).pipe(
    //                     catchOffline(),
    //                     map(resp => {
    //                         this._$log.generateGroup('[FETCH RESPONSE SEARCH ACCOUNT] ONLINE', {
    //                             response: {
    //                                 type: 'log',
    //                                 value: resp
    //                             }
    //                         });

    //                         const newResp =
    //                             resp && resp.length > 0
    //                                 ? [
    //                                       ...resp.map(account => {
    //                                           return {
    //                                               ...new Account(
    //                                                   account.id,
    //                                                   account.fullName,
    //                                                   account.email,
    //                                                   account.phoneNo,
    //                                                   account.mobilePhoneNo,
    //                                                   account.idNo,
    //                                                   account.taxNo,
    //                                                   account.status,
    //                                                   account.imageUrl,
    //                                                   account.taxImageUrl,
    //                                                   account.idImageUrl,
    //                                                   account.selfieImageUrl,
    //                                                   account.urbanId,
    //                                                   account.userStores,
    //                                                   account.userBrands,
    //                                                   account.roles,
    //                                                   account.urban,
    //                                                   account.createdAt,
    //                                                   account.updatedAt,
    //                                                   account.deletedAt
    //                                               )
    //                                           };
    //                                       })
    //                                   ]
    //                                 : [];

    //                         return DropdownActions.fetchSearchAccountSuccess({
    //                             payload: newResp
    //                         });
    //                     }),
    //                     catchError(err =>
    //                         of(
    //                             DropdownActions.fetchSearchAccountFailure({
    //                                 payload: {
    //                                     id: 'fetchAccountSearchFailure',
    //                                     errors: err
    //                                 }
    //                             })
    //                         )
    //                     )
    //                 );
    //             }

    //             this._$log.generateGroup('[FETCH SEARCH ACCOUNT REQUEST] OFFLINE', {
    //                 online: {
    //                     type: 'log',
    //                     value: isOnline
    //                 },
    //                 payload: {
    //                     type: 'log',
    //                     value: payload
    //                 }
    //             });

    //             return of(
    //                 DropdownActions.fetchSearchAccountFailure({
    //                     payload: {
    //                         id: 'fetchAccountSearchFailure',
    //                         errors: 'Offline'
    //                     }
    //                 })
    //             );
    //         })
    //     )
    // );

    constructor(
        private actions$: Actions,
        private store: Store<fromRoot.State>,
        private storage: StorageMap,
        protected network: Network,
        private _$log: LogService,
        // private _$accountApi: AccountApiService,
        private _$clusterApi: ClusterApiService,
        // private _$creditLimitGroupApi: CreditLimitGroupApiService,
        private _$districtApi: DistrictApiService,
        private _$hierarchyApi: HierarchyApiService,
        private _$invoiceGroupApi: InvoiceGroupApiService,
        private _$locationSearchApi: LocationSearchApiService,
        private _$provinceApi: ProvinceApiService,
        private _$roleApi: RoleApiService,
        private _$storeClusterApi: StoreClusterApiService,
        private _$storeGroupApi: StoreGroupApiService,
        private _$storeSegmentApi: StoreSegmentApiService,
        private _$storeTypeApi: StoreTypeApiService,
        private _$urbanApi: UrbanApiService,
        private _$vehicleAccessibilityApi: VehicleAccessibilityApiService
    ) {}
}
