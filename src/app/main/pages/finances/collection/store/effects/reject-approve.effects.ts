import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { LogService, NoticeService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import * as fromRoot from '../../../../../../store/app.reducer'
import { of } from 'rxjs';
import {
    catchError,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import { ApproveRejectApiService, CollectionApiService } from '../../services';
import { BillingActions, RejectReasonActions } from '../actions';
import * as collectionStatus from '../reducers';

@Injectable()
export class RejectApproveEffects {
    // -----------------------------------------------------------------------------------------------------
    // Collection
    // -----------------------------------------------------------------------------------------------------
    /**
     *
     * [REQUEST] Reject Reason List Statuses
     * @memberof Reject Approve Effects
     */
    fetchRejectReasonRequest$ = createEffect(() =>
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
        )
    );

    fetchRejectReasonFailure$ = createEffect(
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

    /**
     *
     * [REQUEST] Collection Payment Approval
     * @memberof Reject Approve Effects
     */

    updateColPaymentApproval$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                RejectReasonActions.updateColPaymentApprovalRequest,
            ),
            map((action) => action.payload),
            switchMap(({ body, id }) => {
                return this._$rejectApproveApi.patchRejectApprove(body, id).pipe(
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
        )
    );

    /**
     *
     * [UPDATE - SUCCESS] Collection Payment Approval
     * @memberof Reject Approve Effects
     */
    updateColPaymentApprovalSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(
                    RejectReasonActions.updateColPaymentApprovalSuccess,
                ),
                tap((resp) => {
                    console.log("resp", resp)
                    this._$notice.open('Successfully Approved', 'success', {
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
    updateColPaymentApprovalFailure$ = createEffect(
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
    // Billing
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Billing Payment Approval
     * @memberof Reject Approve Effects
     */

    updateBillingPaymentApproval$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                RejectReasonActions.updateBillingPaymentApprovalRequest,
            ),
            map((action) => action.payload),
            switchMap(({body, id}) => {
                return this._$rejectApproveApi.patchRejectApprove(body, id).pipe(
                    map(() => {
                        return RejectReasonActions.updateBillingPaymentApprovalSuccess({
                            payload: {
                                id,
                                changes: {
                                    approvalStatus: body.approvalStatus,
                                    billingRef: body.billingRef,
                                },
                            },
                        });
                    }),
                    catchError((err) =>
                        of(
                            RejectReasonActions.updateBillingPaymentApprovalFailure({
                                payload: { id: 'updateBillingPaymentApprovalFailure', errors: err },
                            })
                        )
                    ),
                    finalize(() => {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    })
                );
            })
        )
    );

    /**
     *
     * [UPDATE - SUCCESS] Billinglection Payment Approval
     * @memberof Reject Approve Effects
     */
    updateBillingPaymentApprovalSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(
                    RejectReasonActions.updateBillingPaymentApprovalSuccess,
                ),
                tap(() => {
                    this._$notice.open('Billing Approved', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                }),
                withLatestFrom(
                    this.store.select(fromRoot.getRouterState),
                    (action, router) => {
                        return {
                            id: router.state.params.id,
                        }
                    }
                ),
                switchMap(newPayload => {
                    return this._$collectionStatusApi.findByIdBillingUpdateMock(newPayload).pipe(
                        catchOffline(),
                        map((resp) => {
                            return BillingActions.fetchBillingDetailUpdateSuccess({
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
                        )
                    );
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - FAILURE] Billinglection Payment Approval
     * @memberof Reject Approve Effects
     */
    updateBillingPaymentApprovalFailure$ = createEffect(
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
