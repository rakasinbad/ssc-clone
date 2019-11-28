import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import {
    ClusterApiService,
    HierarchyApiService,
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
import {
    Cluster,
    Hierarchy,
    Province,
    Role,
    StoreGroup,
    StoreSegment,
    StoreType,
    Urban,
    VehicleAccessibility
} from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';
import { sortBy } from 'lodash';
import { of } from 'rxjs';
import { catchError, map, retry, switchMap } from 'rxjs/operators';

import { DropdownActions } from '../actions';

// import { Account } from 'app/main/pages/accounts/models';
// import { RoleApiService } from 'app/main/pages/roles/role-api.service';
// import { Role } from 'app/main/pages/roles/role.model';
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
                    map(resp => {
                        const sources = (resp as Array<Province>).map(row => {
                            const newProvince = new Province(
                                row.id,
                                row.name,
                                row.createdAt,
                                row.updatedAt,
                                row.deletedAt
                            );

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
            switchMap(() => {
                return this._$hierarchyApi
                    .findAll<Hierarchy[]>({ paginate: false })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            this._$log.generateGroup(
                                '[RESPONSE REQUEST FETCH HIERARCHY DROPDOWN]',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                }
                            );

                            const newResp =
                                resp && resp.length > 0
                                    ? resp.map(row => {
                                          const newHierarchy = new Hierarchy(
                                              row.id,
                                              row.name,
                                              row.status,
                                              row.supplierId,
                                              row.createdAt,
                                              row.updatedAt,
                                              row.deletedAt
                                          );

                                          return newHierarchy;
                                      })
                                    : [];

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
            switchMap(_ => {
                if (this._isOnline) {
                    this._$log.generateGroup('[REQUEST FETCH DROPDOWN ROLE] ONLINE', {
                        online: {
                            type: 'log',
                            value: this._isOnline
                        }
                    });
                }

                return this._$roleApi
                    .findAll<Role[]>({ paginate: false })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        // map(resp => (!resp['data'] ? (resp as Role[]) : null)),
                        map(resp => {
                            this._$log.generateGroup('[RESPONSE REQUEST FETCH DROPDOWN ROLE]', {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            const newResp =
                                resp && resp.length > 0
                                    ? resp.map(row => {
                                          return new Role(
                                              row.id,
                                              row.role,
                                              row.description,
                                              row.status,
                                              row.roleTypeId,
                                              row.createdAt,
                                              row.updatedAt,
                                              row.deletedAt
                                          );
                                      })
                                    : [];

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
                        this._$log.generateGroup('[RESPONSE REQUEST FETCH PROVINCE DROPDOWN]', {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        const newResp =
                            resp && resp.length > 0
                                ? resp.map(row => {
                                      const newProvince = new Province(
                                          row.id,
                                          row.name,
                                          row.createdAt,
                                          row.updatedAt,
                                          row.deletedAt
                                      );

                                      if (row.urbans) {
                                          newProvince.urbans = row.urbans;
                                      }

                                      return newProvince;
                                  })
                                : [];

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
                            this._$log.generateGroup(
                                '[RESPONSE REQUEST FETCH STORE CLUSTER DROPDOWN]',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                },
                                'groupCollapsed'
                            );

                            const newResp =
                                resp && resp.length > 0
                                    ? resp.map(row => {
                                          const newCluster = new Cluster(
                                              row.id,
                                              row.name,
                                              row.supplierId,
                                              row.createdAt,
                                              row.updatedAt,
                                              row.deletedAt
                                          );

                                          if (row.supplier) {
                                              newCluster.supplier = row.supplier;
                                          }

                                          return newCluster;
                                      })
                                    : [];

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
                            this._$log.generateGroup(
                                '[RESPONSE REQUEST FETCH STORE GROUP DROPDOWN]',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                },
                                'groupCollapsed'
                            );

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
                            this._$log.generateGroup(
                                '[RESPONSE REQUEST FETCH STORE SEGMENT DROPDOWN]',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                },
                                'groupCollapsed'
                            );

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
                            this._$log.generateGroup(
                                '[RESPONSE REQUEST FETCH STORE TYPE DROPDOWN]',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                },
                                'groupCollapsed'
                            );

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
                            this._$log.generateGroup(
                                '[RESPONSE REQUEST FETCH VEHICLE ACCESSIBILITY DROPDOWN]',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                },
                                'groupCollapsed'
                            );

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
        protected network: Network,
        private _$log: LogService,
        // private _$accountApi: AccountApiService,
        private _$clusterApi: ClusterApiService,
        private _$hierarchyApi: HierarchyApiService,
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
