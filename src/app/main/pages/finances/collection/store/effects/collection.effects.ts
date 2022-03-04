import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { of, throwError } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { CollectionApiService } from '../../services';
import { BillingActions, CollectionActions } from '../actions';
import {
    BillingStatus,
    CalculateCollectionStatusPayment,
    CollectionStatus,
    FinanceDetailBillingV1,
} from '../../models';
import * as collectionStatus from '../reducers';
import * as fromBilling from '../reducers/billing.reducer';
import * as fromCollectionDetail from '../reducers/collection-detail.reducer';
import { OrderActions } from '../../../../orders/store/actions';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';
import { APPROVE, REJECT } from '../../constants';

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
    fetchCollectionStatusRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CollectionActions.fetchCollectionStatusRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then((user) => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;
                return of([params, supplierId]);
            }),
            switchMap(([params, data]: [any, string | Auth]) => {
                if (!data) {
                    return of(
                        CollectionActions.fetchCollectionStatusFailure({
                            payload: {
                                id: 'fetchCollectionStatusFailure',
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

                if (!supplierId) {
                    return of(
                        CollectionActions.fetchCollectionStatusFailure({
                            payload: {
                                id: 'fetchCollectionStatusFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                const newParams = {};

                if (supplierId) {
                    newParams['supplierId'] = supplierId;
                    newParams['limit'] = params.payload.limit;
                    newParams['skip'] = params.payload.skip;
                    newParams['approvalStatus'] = params.payload.approvalStatus;
                    newParams['searchBy'] = params.payload.searchBy;
                    newParams['keyword'] = params.payload.keyword;
                }

                return this._$collectionStatusApi
                    .findAllCollection<IPaginatedResponse<CollectionStatus>>(newParams, supplierId)
                    .pipe(
                        catchOffline(),
                        map((resp) => {
                            const newResp = {
                                data:
                                    (resp && resp.data.length > 0
                                        ? resp.data.map((v) => new CollectionStatus(v))
                                        : []) || [],
                                total: resp['meta']['total'],
                            };

                            return CollectionActions.fetchCollectionStatusSuccess({
                                payload: newResp,
                            });
                        }),
                        catchError((err) =>
                            of(
                                CollectionActions.fetchCollectionStatusFailure({
                                    payload: {
                                        id: 'fetchCollectionStatusFailure',
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
                        resp.errors.error && resp.errors.error.errorMessage
                            ? resp.errors.error.errorMessage
                            : resp.errors.errorMessage;

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

    fetchBillingStatusRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BillingActions.fetchBillingStatusRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then((user) => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;
                return of([params, supplierId]);
            }),
            switchMap(([params, data]: [any, string | Auth]) => {
                if (!data) {
                    return of(
                        BillingActions.fetchBillingStatusFailure({
                            payload: {
                                id: 'fetchBillingStatusFailure',
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

                if (!supplierId) {
                    return of(
                        BillingActions.fetchBillingStatusFailure({
                            payload: {
                                id: 'fetchBillingStatusFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                const newParams = {};

                if (supplierId) {
                    newParams['supplierId'] = supplierId;
                    newParams['limit'] = params.payload.limit;
                    newParams['skip'] = params.payload.skip;
                    newParams['searchBy'] = params.payload.searchBy;
                    newParams['keyword'] = params.payload.keyword;
                }

                return this._$collectionStatusApi
                    .findAllBilling<IPaginatedResponse<BillingStatus>>(newParams, supplierId)
                    .pipe(
                        catchOffline(),
                        map((resp) => {
                            const newResp = {
                                data:
                                    (resp && resp.data.length > 0
                                        ? resp.data.map((v) => new BillingStatus(v))
                                        : []) || [],
                                total: resp['meta']['total'],
                            };

                            return BillingActions.fetchBillingStatusSuccess({
                                payload: newResp,
                            });
                        }),
                        catchError((err) =>
                            of(
                                BillingActions.fetchBillingStatusFailure({
                                    payload: {
                                        id: 'fetchBillingStatusFailure',
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
     * [REQUEST - FAILURE] Billing List Statuses
     * @memberof CollectionEffects
     */
    fetchBillingStatusFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BillingActions.fetchBillingStatusFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message =
                        resp.errors.error && resp.errors.error.errorMessage
                            ? resp.errors.error.errorMessage
                            : resp.errors.errorMessage;

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

    //detial
    /**
     *
     * [REQUEST] Detail Billing
     * @memberof CollectionEffects
     */
    fetchBillingDetailRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BillingActions.fetchBillingDetailRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then((user) => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;
                return of([params, supplierId]);
            }),
            switchMap(([params, data]: [any, string | Auth]) => {
                
                let supplierId;

                if (typeof data === 'string') {
                    supplierId = data;
                } else {
                    supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                }

                if (!supplierId) {
                    return of(
                        BillingActions.fetchBillingDetailFailure({
                            payload: {
                                id: 'fetchBillingDetailFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                const newParams = {};

                if (supplierId) {
                    newParams['supplierId'] = supplierId;
                }
                
                return this._$collectionStatusApi
                    .findByIdBilling({ id: params.payload.id }, newParams)
                    .pipe(
                        catchOffline(),
                        map((resp) => {
                            if(params.payload.type === APPROVE){
                                this._$notice.open("Billing Approved", 'success', {
                                    verticalPosition: 'bottom',
                                    horizontalPosition: 'right',
                                });
                              
                                return BillingActions.fetchBillingDetailUpdate({
                                    payload: {
                                        id: params.payload.id,
                                        changes: {
                                            ...resp,
                                        },
                                    },
                                });
                            }

                            if(params.payload.type === REJECT){
                                this._$notice.open("Billing Rejected", 'error', {
                                    verticalPosition: 'bottom',
                                    horizontalPosition: 'right',
                                });
                                
                                return BillingActions.fetchBillingDetailUpdate({
                                    payload: {
                                        id: params.payload.id,
                                        changes: {
                                            ...resp,
                                        },
                                    },
                                });
                            }

                            return BillingActions.fetchBillingDetailSuccess({
                                payload: resp,
                            });
                        }),
                        catchError((err) =>
                            of(
                                BillingActions.fetchBillingDetailFailure({
                                    payload: {
                                        id: 'fetchBillingDetailFailure',
                                        errors: err,
                                    },
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchBillingDetailFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BillingActions.fetchBillingDetailFailure),
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
                                resp.errors.error && resp.errors.error.errorMessage
                                    ? resp.errors.error.errorMessage
                                    : resp.errors.errorMessage;
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

                return of([params, supplierId]);
            }),
            switchMap(([params, data]: [any, string | Auth]) => {
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
                        map((resp) => {
                            const newResp = {
                                data:
                                    (resp && resp.data.length > 0
                                        ? resp.data.map(
                                              (v) => new CalculateCollectionStatusPayment(v)
                                          )
                                        : []) || [],
                            };

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
                            : resp.errors.error.errorMessage || resp.errors.errorMessage;

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
    fetchCollectionDetailRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CollectionActions.fetchCollectionDetailRequest),
            map((action) => action.payload),
            switchMap((id) => {
                return this._$collectionStatusApi.findById(id).pipe(
                    catchOffline(),
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
                                resp.errors.error && resp.errors.error.errorMessage
                                    ? resp.errors.error.errorMessage
                                    : resp.errors.errorMessage;
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

    /**
     *
     * [REQUEST] Collection Photo
     * @memberof CollectionEffects
     */
    fetchCollectionPhotoRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CollectionActions.fetchCollectionPhotoRequest),
            map((action) => action.payload),
            switchMap((payload) => {
                return this._$collectionStatusApi.findCollectionPhotoById(payload.id).pipe(
                    catchOffline(),
                    map((resp) => {
                        return CollectionActions.fetchCollectionPhotoSuccess({
                            payload: resp,
                        });
                    }),
                    catchError((err) =>
                        of(
                            CollectionActions.fetchCollectionPhotoFailure({
                                payload: {
                                    id: 'fetchCollectionPhotoFailure',
                                    errors: err,
                                },
                            })
                        )
                    )
                );
            })
        )
    );

    fetchCollectionPhotoFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CollectionActions.fetchCollectionPhotoFailure),
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
                                resp.errors.error && resp.errors.error.errorMessage
                                    ? resp.errors.error.errorMessage
                                    : resp.errors.errorMessage;
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
