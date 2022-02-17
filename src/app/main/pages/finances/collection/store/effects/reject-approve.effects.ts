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
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { ApproveRejectApiService, CollectionApiService } from '../../services';
import { BillingActions, RejectReasonActions } from '../actions';
import * as collectionStatus from '../reducers';
import { ErrorHandler } from 'app/shared/models/global.model';

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
     @Effect() fetchRejectReasonRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(RejectReasonActions.fetchRejectReasonRequest),
            map((action) => action.payload),
            switchMap((payload) => {
                return this._$rejectApproveApi.getRejectReasonList(payload.type).pipe(
                    catchOffline(),
                    map((resp) => {
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
        ),{dispatch: false}
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

     @Effect() updateColPaymentApproval$ = createEffect(() =>
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
                                    ...body,
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
        ),{dispatch: false}
    );

    /**
     *
     * [UPDATE - SUCCESS] Collection Payment Approval
     * @memberof Reject Approve Effects
     */
     @Effect() updateColPaymentApprovalSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateColPaymentApprovalSuccess),
                tap((resp) => {
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
     @Effect() updateColPaymentApprovalFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateColPaymentApprovalFailure),
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

    /**
     *
     * [REQUEST] Collection Payment Reject
     * @memberof Reject Approve Effects
     */

    updateColPaymentReject$ = createEffect(() =>
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
                                    ...body,
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
        ),{dispatch: false}
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
                tap((resp) => {
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
    updateColPaymentRejectFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateColPaymentRejectFailure),
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
    // Billing
    // -----------------------------------------------------------------------------------------------------

    @Effect() fetchBillingDetailUpdateAfterApproveSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(
                    BillingActions.fetchBillingDetailUpdateAfterApproveSuccess,
                ),
                tap((resp) => {
                    this._$notice.open('Billing Approved', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    @Effect() fetchBillingDetailUpdateAfterRejectSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(
                    BillingActions.fetchBillingDetailUpdateAfterRejectSuccess,
                ),
                tap((resp) => {
                    
                    this._$notice.open('Billing Rejected', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );
    /**
     *
     * [UPDATE - REQUEST] Billing Payment Approval
     */
     @Effect() updateBillingPaymentApprovalRequest$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(
                    RejectReasonActions.updateBillingPaymentApprovalRequest,
                ),
                withLatestFrom(
                    this.store.select(fromRoot.getRouterState),
                    (action, router) => {
                        return {
                            id: router.state.params.id,
                            body: action.payload
                        }
                    }
                ),
                switchMap(newPayload => {
                    return this._$rejectApproveApi.patchRejectApproveBilling(newPayload.body.body, newPayload.id).pipe(
                        catchOffline(),
                        map((resp) => {
                            if(resp && newPayload){
                                return this._$collectionStatusApi.findByIdBilling(newPayload.id).pipe(
                                    map((resp) => {
                                        return BillingActions.fetchBillingDetailUpdateAfterApproveSuccess({
                                            payload: {
                                                id: newPayload.id,
                                                changes: {
                                                    ...resp,
                                                },
                                            },
                                        });
                                    }),
                                    catchError((err) =>
                                        of(
                                            BillingActions.fetchBillingDetailUpdateFailure({
                                                payload: {
                                                    id: 'fetchBillingDetailUpdateFailure',
                                                    errors: err,
                                                },
                                            })
                                        )
                                    ),
                                    finalize(() => {
                                        this.store.dispatch(UiActions.resetHighlightRow());
                                    })
                                )
                            }else{
                                return UiActions.resetHighlightRow();
                            }
                        }),
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
     */
    @Effect() updateBillingPaymentRejectRequest$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(
                    RejectReasonActions.updateBillingPaymentRejectRequest,
                ),
                withLatestFrom(
                    this.store.select(fromRoot.getRouterState),
                    (action, router) => {
                        return {
                            id: router.state.params.id,
                            body: action.payload
                        }
                    }
                ),
                switchMap(newPayload => {
                    return this._$rejectApproveApi.patchRejectApproveBilling(newPayload.body.body, newPayload.body.id).pipe(
                        catchOffline(),
                        map((resp) => {
                            if(resp && newPayload){
                                
                                return this._$collectionStatusApi.findByIdBilling(newPayload.id).pipe(
                                    map((resp) => {
                                        return BillingActions.fetchBillingDetailUpdateAfterRejectSuccess({
                                            payload: {
                                                id: newPayload.id,
                                                changes: {
                                                    ...resp,
                                                },
                                            },
                                        });
                                    }),
                                    catchError((err) =>
                                        of(
                                            BillingActions.fetchBillingDetailUpdateFailure({
                                                payload: {
                                                    id: 'fetchBillingDetailUpdateFailure',
                                                    errors: err,
                                                },
                                            })
                                        )
                                    ),
                                    finalize(() => {
                                        this.store.dispatch(UiActions.resetHighlightRow());
                                    })
                                )
                            }else{
                                return UiActions.resetHighlightRow();
                            }
                        }),
                        catchError((err) =>{
                            
                            return of(
                                RejectReasonActions.updateBillingPaymentRejectFailure({
                                    payload: {
                                        id: 'updateBillingPaymentRejectFailure',
                                        errors: err,
                                    },
                                })
                            )
                        }),
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
     * [UPDATE - FAILURE] Billing Payment Approval
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
    @Effect({ dispatch: false }) updateBillingPaymentRejectFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.updateBillingPaymentRejectFailure),
                map((action) => { 
                    
                    return action.payload
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
