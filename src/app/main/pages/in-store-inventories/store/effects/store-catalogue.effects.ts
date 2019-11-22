import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { LogService, NoticeService } from 'app/shared/helpers';
import { NetworkActions } from 'app/shared/store/actions';
import { getParams } from 'app/store/app.reducer';
import { NetworkSelectors } from 'app/shared/store/selectors';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
// import { StoreCatalogue } from '../../models';
import { StoreCatalogueApiService } from '../../services';
import { StoreCatalogueActions } from '../actions';
import { fromStoreCatalogue } from '../reducers';
import { IPaginatedResponse, IQueryParams } from 'app/shared/models';
import { CataloguesService } from 'app/main/pages/catalogues/services';

@Injectable()
export class StoreCatalogueEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    // fetchAttendanceRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(AttendanceActions.fetchAttendanceRequest),
    //         map(action => action.payload),
    //         switchMap(id => {
    //             /** WITHOUT PAGINATION */
    //             return this.attendanceApiSvc.findById(id).pipe(
    //                 catchOffline(),
    //                 map(resp => {
    //                     const newResp = new Attendance(
    //                         resp.id,
    //                         resp.date,
    //                         resp.longitudeCheckIn,
    //                         resp.latitudeCheckIn,
    //                         resp.longitudeCheckOut,
    //                         resp.latitudeCheckOut,
    //                         resp.checkIn,
    //                         resp.checkOut,
    //                         resp.locationType,
    //                         resp.attendanceType,
    //                         resp.userId,
    //                         resp.user,
    //                         resp.createdAt,
    //                         resp.updatedAt,
    //                         resp.deletedAt
    //                     );

    //                     // newResp.user.setUserStores = resp.user.userStores;

    //                     return AttendanceActions.fetchAttendanceSuccess({
    //                         payload: {
    //                             attendance: newResp,
    //                             source: 'fetch'
    //                         }
    //                     });
    //                 }),
    //                 catchError(err =>
    //                     of(
    //                         AttendanceActions.fetchAttendanceFailure({
    //                             payload: {
    //                                 id: 'fetchAttendanceFailure',
    //                                 errors: err
    //                             }
    //                         })
    //                     )
    //                 )
    //             );
    //         })
    //     )
    // );

    fetchCatalogueHistoriesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreCatalogueActions.fetchStoreCatalogueHistoriesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([queryParams, { supplierId }]) => {
                /** NO SUPPLIER ID! */
                if (!supplierId) {
                    return of(StoreCatalogueActions.fetchStoreCataloguesFailure({
                        payload: {
                            id: 'fetchStoreCataloguesFailure',
                            errors: 'Not authenticated'
                        }
                    }));
                }

                /** WITH PAGINATION */
                if (queryParams.paginate) {
                    return this.storeCatalogueApiSvc.findCatalogueHistory<IPaginatedResponse<any>>(queryParams).pipe(
                        catchOffline(),
                        map(resp => {
                            let newResp = {
                                total: 0,
                                data: []
                            };

                            newResp = {
                                total: resp.total,
                                data: resp.data
                            };
    
                            return StoreCatalogueActions.fetchStoreCatalogueHistoriesSuccess({
                                payload: {
                                    catalogueHistories: newResp.data,
                                    total: newResp.total
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                StoreCatalogueActions.fetchStoreCatalogueHistoriesFailure({
                                    payload: {
                                        id: 'fetchStoreCatalogueHistoriesFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                }

                /** WITHOUT PAGINATION */
                return this.storeCatalogueApiSvc.findCatalogueHistory<Array<any>>(queryParams).pipe(
                    catchOffline(),
                    map(resp => {
                        let newResp = {
                            total: 0,
                            data: []
                        };

                        newResp = {
                            total: resp.length,
                            data: resp
                        };

                        return StoreCatalogueActions.fetchStoreCatalogueHistoriesSuccess({
                            payload: {
                                catalogueHistories: newResp.data,
                                total: newResp.total
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            StoreCatalogueActions.fetchStoreCatalogueHistoriesFailure({
                                payload: {
                                    id: 'fetchStoreCatalogueHistoriesFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchStoreCatalogueRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreCatalogueActions.fetchStoreCatalogueRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([catalogueId, { supplierId }]) => {
                /** NO SUPPLIER ID! */
                if (!supplierId) {
                    return of(StoreCatalogueActions.fetchStoreCatalogueFailure({
                        payload: {
                            id: 'fetchStoreCatalogueFailure',
                            errors: 'Not authenticated'
                        }
                    }));
                }

                return this.catalogueApiSvc.findById(catalogueId).pipe(
                    catchOffline(),
                    map(resp => {
                        return StoreCatalogueActions.fetchStoreCatalogueSuccess({
                            payload: {
                                storeCatalogue: resp,
                                source: 'fetch'
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            StoreCatalogueActions.fetchStoreCatalogueFailure({
                                payload: {
                                    id: 'fetchStoreCatalogueFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchStoreCataloguesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreCatalogueActions.fetchStoreCataloguesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([queryParams, { supplierId }]) => {
                /** NO SUPPLIER ID! */
                if (!supplierId) {
                    return of(StoreCatalogueActions.fetchStoreCataloguesFailure({
                        payload: {
                            id: 'fetchStoreCataloguesFailure',
                            errors: 'Not authenticated'
                        }
                    }));
                }

                /** WITH PAGINATION */
                if (queryParams.paginate) {
                    return this.storeCatalogueApiSvc.find<IPaginatedResponse<any>>(queryParams).pipe(
                        catchOffline(),
                        map(resp => {
                            let newResp = {
                                total: 0,
                                data: []
                            };

                            newResp = {
                                total: resp.total,
                                data: resp.data
                            };
    
                            return StoreCatalogueActions.fetchStoreCataloguesSuccess({
                                payload: {
                                    storeCatalogues: newResp.data,
                                    total: newResp.total
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                StoreCatalogueActions.fetchStoreCataloguesFailure({
                                    payload: {
                                        id: 'fetchStoreCataloguesFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                }

                /** WITHOUT PAGINATION */
                return this.storeCatalogueApiSvc.find<Array<any>>(queryParams).pipe(
                    catchOffline(),
                    map(resp => {
                        let newResp = {
                            total: 0,
                            data: []
                        };

                        newResp = {
                            total: resp.length,
                            data: resp
                        };

                        this.logSvc.generateGroup(
                            '[FETCH RESPONSE ATTENDANCES REQUEST] ONLINE',
                            {
                                payload: {
                                    type: 'log',
                                    value: resp
                                }
                            }
                        );

                        return StoreCatalogueActions.fetchStoreCataloguesSuccess({
                            payload: {
                                storeCatalogues: newResp.data,
                                total: newResp.total
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            StoreCatalogueActions.fetchStoreCataloguesFailure({
                                payload: {
                                    id: 'fetchStoreCataloguesFailure',
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
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromStoreCatalogue.FeatureState>,
        private catalogueApiSvc: CataloguesService,
        private storeCatalogueApiSvc: StoreCatalogueApiService,
        private logSvc: LogService,
        private _$notice: NoticeService
    ) {}
}
