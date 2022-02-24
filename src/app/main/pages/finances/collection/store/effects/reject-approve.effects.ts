import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { LogService, NoticeService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import * as fromRoot from '../../../../../../store/app.reducer';
import { Observable, of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom,
    share,
    take,
    debounceTime,
    distinctUntilChanged
} from 'rxjs/operators';
import { ApproveRejectApiService, CollectionApiService } from '../../services';
import { BillingActions, RejectReasonActions } from '../actions';
import * as collectionStatus from '../reducers';
import { ErrorHandler } from 'app/shared/models/global.model';
import { ColPaymentApproval } from '../../models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { Auth } from 'app/main/pages/core/auth/models';
import { APPROVE, REJECT } from '../../constants';

@Injectable()
export class RejectApproveEffects {
    // -----------------------------------------------------------------------------------------------------
    // Reject Reason List
    // -----------------------------------------------------------------------------------------------------
    /**
     *
     * [REQUEST] Reject Reason List Statuses
     * @memberof Reject Approve Effects
     */
    @Effect() fetchRejectReasonRequest$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.fetchRejectReasonRequest),
                map((action) => action.payload),
                switchMap((payload) => {
                    return this._$rejectApproveApi.getRejectReasonList(payload.type).pipe(
                        catchOffline(),
                        map((resp: { data: ColPaymentApproval[] }) => {
                            return RejectReasonActions.fetchRejectReasonSuccess({
                                payload: resp,
                            });
                        }),
                        catchError((err) =>
                            of(
                                RejectReasonActions.fetchRejectReasonFailure({
                                    payload: {
                                        id: 'fetchRejectReasonFailure',
                                        errors: err,
                                    },
                                })
                            )
                        )
                    );
                })
            ),
        { dispatch: false }
    );

    @Effect() fetchRejectReasonFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.fetchRejectReasonFailure),
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

    // -----------------------------------------------------------------------------------------------------
    // Collecetion
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Collection Payment Approval
     * @memberof Reject Approve Effects
     */

    updateColPaymentApproval$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateColPaymentApprovalRequest),
                map((action) => action.payload),
                switchMap(({ body, id }) => {
                    return this._$rejectApproveApi.patchRejectApproveCollection(body, id).pipe(
                        map((resp) => {
                            return RejectReasonActions.updateColPaymentApprovalSuccess({
                                payload: {
                                    id,
                                    changes: {
                                        ...resp,
                                    },
                                },
                            });
                        }),
                        catchError((err) =>
                            of(
                                RejectReasonActions.updateColPaymentApprovalFailure({
                                    payload: { id: 'updateColPaymentApprovalFailure', errors: err },
                                })
                            )
                        ),
                        finalize(() => {
                            this.store.dispatch(UiActions.resetHighlightRow());
                        })
                    );
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Collection Payment Approval
     * @memberof Reject Approve Effects
     */
    updateColPaymentApprovalSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateColPaymentApprovalSuccess),
                map(action => action.payload),
                tap(() => {
                    this._$notice.open('Collection Approved', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - FAILURE] Collection Payment Approval
     * @memberof Reject Approve Effects
     */
    @Effect({ dispatch: false }) updateColPaymentApprovalFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateColPaymentApprovalFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

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
     * [REQUEST] Collection Payment Reject
     * @memberof Reject Approve Effects
     */

    updateColPaymentReject$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateColPaymentRejectRequest),
                map((action) => action.payload),
                switchMap(({ body, id }) => {
                    return this._$rejectApproveApi.patchRejectApproveCollection(body, id).pipe(
                        map((resp) => {
                            return RejectReasonActions.updateColPaymentRejectSuccess({
                                payload: {
                                    id,
                                    changes: {
                                        ...resp,
                                    },
                                },
                            });
                        }),
                        catchError((err) =>
                            of(
                                RejectReasonActions.updateColPaymentRejectFailure({
                                    payload: { id: 'updateColPaymentRejectFailure', errors: err },
                                })
                            )
                        ),
                        finalize(() => {
                            this.store.dispatch(UiActions.resetHighlightRow());
                        })
                    );
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Collection Payment Reject
     * @memberof Reject Approve Effects
     */
    updateColPaymentRejectSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateColPaymentRejectSuccess),
                map(action => action.payload),
                tap(() => {
                    this._$notice.open('Collection Rejected', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - FAILURE] Collection Payment Reject
     * @memberof Reject Approve Effects
     */
    @Effect({ dispatch: false }) updateColPaymentRejectFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateColPaymentRejectFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // Billing
    // -----------------------------------------------------------------------------------------------------


    /**
     *
     * [UPDATE - REQUEST] Billing Payment Approval
     *  @memberof Reject Approve Effects
     */
    updateBillingPaymentApprovalRequest$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateBillingPaymentApprovalRequest),
                withLatestFrom(this.store.select(fromRoot.getRouterState), (action, router) => {
                    return {
                        id: action.payload.id,
                        body: action.payload,
                        router: router.state.params
                    };
                }),
                take(1),
                debounceTime(500),
                distinctUntilChanged(),
                switchMap((newPayload) => {
                    
                    return this._$rejectApproveApi
                        .patchRejectApproveBilling(newPayload.body.body, newPayload.id)
                        .pipe(take(1))
                        .pipe(
                            catchOffline(),
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
                            switchMap(([params, data]) => {
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

                                return of(
                                    BillingActions.fetchBillingDetailUpdateRequest({
                                        payload: {
                                            idDetail: newPayload.router.id,
                                            type:  APPROVE
                                        },
                                    })
                                )
                            }),
                            take(1),
                            catchError((err) =>
                                of(
                                    RejectReasonActions.updateBillingPaymentApprovalFailure({
                                        payload: {
                                            id: 'updateBillingPaymentApprovalFailure',
                                            errors: err,
                                        },
                                    })
                                )
                            ),
                            share(),
                            finalize(() => {
                                this.store.dispatch(UiActions.resetHighlightRow());
                            })
                        );
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - REQUEST] Billing Payment Reject
     *  @memberof Reject Approve Effects
     */

    updateBillingPaymentRejectRequest$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateBillingPaymentRejectRequest),
                withLatestFrom(this.store.select(fromRoot.getRouterState), (action, router) => {
                    return {
                        id: action.payload.id,
                        body: action.payload,
                        router: router.state.params
                    };
                }),
                take(1),
                debounceTime(500),
                distinctUntilChanged(),
                switchMap((newPayload) => {
                    
                    return this._$rejectApproveApi
                        .patchRejectApproveBilling(newPayload.body.body, newPayload.id)
                        .pipe(take(1))
                        .pipe(
                            catchOffline(),
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
                            switchMap(([params, data]) => {
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

                                return of(
                                    BillingActions.fetchBillingDetailUpdateRequest({
                                        payload: {
                                            idDetail: newPayload.router.id,
                                            type: REJECT
                                        },
                                    })
                                )
                            }),
                            catchError((err) =>
                                of(
                                    RejectReasonActions.updateBillingPaymentRejectFailure({
                                        payload: {
                                            id: 'updateBillingPaymentRejectFailure',
                                            errors: err,
                                        },
                                    })
                                )
                            ),
                            share(),
                            finalize(() => {
                                this.store.dispatch(UiActions.resetHighlightRow());
                            })
                        );
                })
            ),
        { dispatch: false }
    );

    
    /**
     *
     * [UPDATE - REQUEST] Billing Payment Detail Update
     *  @memberof Reject Approve Effects
     */
    @Effect() fetchBillingDetailUpdateRequest$ = createEffect(
        () => this.actions$.pipe(
            ofType(BillingActions.fetchBillingDetailUpdateRequest),
            map((resp) => {
                if(resp.payload.type === APPROVE){
                    return BillingActions.fetchBillingDetailRequest({ payload: { id: resp.payload.idDetail, type: APPROVE } })    
                }else{
                    return BillingActions.fetchBillingDetailRequest({ payload: { id: resp.payload.idDetail, type: REJECT } })
                }
            }),
            catchError((err) =>
            of(
                BillingActions.fetchBillingDetailFailure({
                    payload: {
                        id: 'fetchBillingDetailFailure',
                        errors: err,
                    },
                })
            ),
        ),
        finalize(() => {
            this.store.dispatch(UiActions.resetHighlightRow());
        }) 
        )
    )

    /**
     *
     * [UPDATE - FAILURE] Billing Payment Approval
     *  @memberof Reject Approve Effects
     */
    @Effect({ dispatch: false }) updateBillingPaymentApprovalFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateBillingPaymentApprovalFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

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
     * [UPDATE - FAILURE] Billing Payment 
     *  @memberof Reject Approve Effects
     */
    @Effect({ dispatch: false }) updateBillingPaymentRejectFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateBillingPaymentRejectFailure),
                map((action) => {
                    return action.payload;
                }),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    private _handleErrMessage(resp: ErrorHandler): string {
        if (typeof resp.errors === 'string') {
            return resp.errors;
        } else if (resp.errors.error && resp.errors.error.message) {
            return resp.errors.error.message;
        } else {
            return resp.errors.message;
        }
    }

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private storage: StorageMap,
        private store: Store<collectionStatus.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$rejectApproveApi: ApproveRejectApiService,
        private _$collectionStatusApi: CollectionApiService
    ) {}
}
