import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import {
    CalculateOrderApiService,
    DownloadApiService,
    LogService,
    NoticeService,
    UploadApiService,
} from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    retry,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { CollectionApiService } from '../../services';
import { CollectionActions } from '../actions';
import { CalculateCollectionStatusPayment } from '../../models';
import * as collectionStatus from '../reducers';
import * as fromBilling from '../reducers/billing.reducer';
import * as fromCollectionDetail from '../reducers/collection-detail.reducer';
import { OrderActions } from '../../../../orders/store/actions';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';

@Injectable()
export class CollectionEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Collection List Statuses
     * @memberof CollectionEffects
     */
    fetchCollectionListStatusesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CollectionActions.fetchCollectionStatusRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        CollectionActions.fetchCollectionStatusFailure({
                            payload: { id: 'fetchCollectionStatusFailure', errors: 'Not Found!' },
                        })
                    );
                }

                return this._$collectionStatusApi.findAllCollection(payload, supplierId).pipe(
                    catchOffline(),
                    map((resp) => {
                        this._$log.generateGroup(
                            'RESPONSE REQUEST FETCH COLLECTION LIST STATUSES',
                            {
                                payload: {
                                    type: 'log',
                                    value: payload,
                                },
                                response: {
                                    type: 'log',
                                    value: resp,
                                },
                            }
                        );

                        const newResp = {
                            total: resp.meta.total,
                            data: resp.data,
                        };

                        return CollectionActions.fetchCollectionStatusSuccess({
                            payload: newResp,
                        });
                    }),
                    catchError((err) =>
                        of(
                            CollectionActions.fetchCollectionStatusFailure({
                                payload: { id: 'fetchCollectionStatusFailure', errors: err },
                            })
                        )
                    )
                );
            })
        )
    );

    // processPromoHierarchyRequest = ([userData, params]: [
    //     User,
    //     IQueryParams
    // ]): Observable<AnyAction> => {
    //     const newParams = {
    //         ...params,
    //     };
    //     const { supplierId } = userData.userSupplier;

    //     if (supplierId) {
    //         newParams['supplierId'] = supplierId;
    //     }
    //     return this.collectionStatusApi$.find<IPaginatedResponse<PromoHierarchy>>(newParams).pipe(
    //         catchOffline(),
    //         map((resp) => {
    //             const newResp = {
    //                 data:
    //                     (resp && resp.data.length > 0
    //                         ? resp.data.map((v) => new PromoHierarchy(v))
    //                         : []) || [],
    //                 total: resp.total,
    //             };

    //             return CollectionActions.fetchPromoHierarchySuccess({
    //                 payload: newResp,
    //             });
    //         }),
    //         catchError((err) => this.sendErrorToState(err, 'fetchCollectionStatusFailure'))
    //     );
    // };

    /**
     *
     * [REQUEST - FAILURE] Collection List Statuses
     * @memberof CollectionEffects
     */
    fetchCollectionStatusFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CollectionActions.fetchCollectionStatusFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message =
                        resp.errors.error && resp.errors.error.message
                            ? resp.errors.error.message
                            : resp.errors.message;

                    this._$log.generateGroup(
                        '[REQUEST FETCH COLLECTION LIST STATUS FAILURE]',
                        {
                            response: {
                                type: 'log',
                                value: resp,
                            },
                            message: {
                                type: 'log',
                                value: message,
                            },
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [REQUEST] Billing List Statuses
     * @memberof CollectionEffects
     */
    fetchBillingListStatusesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CollectionActions.fetchBillingStatusRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        CollectionActions.fetchBillingStatusFailure({
                            payload: { id: 'fetchBillingStatusFailure', errors: 'Not Found!' },
                        })
                    );
                }

                return this._$collectionStatusApi.findAllBilling(payload, supplierId).pipe(
                    catchOffline(),
                    map((resp) => {
                        this._$log.generateGroup('RESPONSE REQUEST FETCH BILLING LIST STATUSES', {
                            payload: {
                                type: 'log',
                                value: payload,
                            },
                            response: {
                                type: 'log',
                                value: resp,
                            },
                        });

                        const newResp = {
                            total: resp.meta.total,
                            data: resp.data,
                        };

                        return CollectionActions.fetchBillingStatusSuccess({
                            payload: newResp,
                        });
                    }),
                    catchError((err) =>
                        of(
                            CollectionActions.fetchBillingStatusFailure({
                                payload: { id: 'fetchBillingStatusFailure', errors: err },
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Billing List Statuses
     * @memberof CollectionEffects
     */
    fetchBillingStatusFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CollectionActions.fetchBillingStatusFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message =
                        resp.errors.error && resp.errors.error.message
                            ? resp.errors.error.message
                            : resp.errors.message;

                    this._$log.generateGroup(
                        '[REQUEST FETCH BILLING LIST STATUS FAILURE]',
                        {
                            response: {
                                type: 'log',
                                value: resp,
                            },
                            message: {
                                type: 'log',
                                value: message,
                            },
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [REQUEST] Calculate for tab type diatas
     * @memberof CollectionEffects
     */
    fetchCalculateCollectionStatusRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CollectionActions.fetchCalculateCollectionStatusRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then((user) => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;
                // console.log('isi params->', params)

                return of([params, supplierId]);
            }),
            switchMap(([params, data]: [any, string | Auth]) => {
                console.log('isi data->', data);
                console.log('params map->', params);
                if (!data) {
                    return of(
                        CollectionActions.fetchCalculateCollectionStatusFailure({
                            payload: {
                                id: 'fetchCalculateCollectionStatusFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                let supplierId;

                if (typeof data === 'string') {
                    supplierId = data;
                } else {
                    supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                }

                let typeValue = params.payload.type;

                if (!supplierId) {
                    return of(
                        CollectionActions.fetchCalculateCollectionStatusFailure({
                            payload: {
                                id: 'fetchCalculateCollectionStatusFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                return this._$collectionStatusApi
                    .getCollectionStatusType<IPaginatedResponse<CalculateCollectionStatusPayment>>(
                        typeValue,
                        supplierId
                    )
                    .pipe(
                        catchOffline(),
                        retry(1),
                        map((resp) => {
                            const newResp = {
                                data:
                                    (resp && resp.data.length > 0
                                        ? resp.data.map(
                                              (v) => new CalculateCollectionStatusPayment(v)
                                          )
                                        : []) || [],
                            };

                            console.log('resp effect->', resp);
                            return CollectionActions.fetchCalculateCollectionStatusSuccess({
                                payload: newResp,
                            });
                        }),
                        catchError((err) =>
                            of(
                                CollectionActions.fetchCalculateCollectionStatusFailure({
                                    payload: {
                                        id: 'fetchCalculateCollectionStatusFailure',
                                        errors: err,
                                    },
                                })
                            )
                        )
                    );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Calculate for tab type diatas
     * @memberof CollectionEffects
     */
    fetchCalculateCollectionStatusFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CollectionActions.fetchCalculateCollectionStatusFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message =
                        typeof resp.errors === 'string'
                            ? resp.errors
                            : resp.errors.error.message || resp.errors.message;

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [REQUEST] Detail Collection
     * @memberof CollectionEffects
     */
    fetchDetailRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CollectionActions.fetchCollectionDetailRequest),
            map((action) => action.payload),
            switchMap((id) => {
                return this._$collectionStatusApi.findById(id).pipe(
                    catchOffline(),
                    retry(3),
                    map((resp) => {
                        return CollectionActions.fetchCollectionDetailSuccess({
                            payload: resp,
                        });
                    }),
                    catchError((err) =>
                        of(
                            CollectionActions.fetchCollectionDetailFailure({
                                payload: {
                                    id: 'fetchCollectionDetailFailure',
                                    errors: err,
                                },
                            })
                        )
                    )
                );
            })
        )
    );

    fetchCollectionDetailFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CollectionActions.fetchCollectionDetailFailure),
                map((action) => action.payload),
                tap((resp) => {
                    let message;

                    if (resp.errors.code === 406) {
                        message = resp.errors.error.errors
                            .map((r) => {
                                return `${r.errCode}<br>${r.solve}`;
                            })
                            .join('<br><br>');
                    } else {
                        if (typeof resp.errors === 'string') {
                            message = resp.errors;
                        } else {
                            message =
                                resp.errors.error && resp.errors.error.message
                                    ? resp.errors.error.message
                                    : resp.errors.message;
                        }
                    }

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private storage: StorageMap,
        private store: Store<collectionStatus.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$collectionStatusApi: CollectionApiService
    ) {}
}
