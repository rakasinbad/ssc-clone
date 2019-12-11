import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import {
    DownloadApiService,
    LogService,
    NoticeService,
    UploadApiService
} from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { PaymentStatusApiService } from '../../services';
import { PaymentStatusActions } from '../actions';
import { fromPaymentStatus } from '../reducers';

@Injectable()
export class PaymentEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [UPDATE - REQUEST] Payment Status
     * @memberof PaymentEffects
     */
    updatePaymentStatusRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PaymentStatusActions.updatePaymentStatusRequest),
            map(action => action.payload),
            switchMap(({ id, body }) => {
                return this._$paymentStatusApi.patch(body, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(
                            'RESPONSE REQUEST UPDATE PAYMENT STATUS',
                            {
                                payload: {
                                    type: 'log',
                                    value: body
                                },
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            },
                            'groupCollapsed'
                        );

                        return PaymentStatusActions.updatePaymentStatusSuccess({
                            payload: {
                                id,
                                changes: resp
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            PaymentStatusActions.updatePaymentStatusFailure({
                                payload: { id: 'updatePaymentStatusFailure', errors: err }
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
     * [UPDATE - FAILURE] Payment Status
     * @memberof PaymentEffects
     */
    updatePaymentStatusFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PaymentStatusActions.updatePaymentStatusFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST UPDATE PAYMENT STATUS FAILURE',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open('Data gagal diubah', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Payment Status
     * @memberof PaymentEffects
     */
    updatePaymentStatusSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PaymentStatusActions.updatePaymentStatusSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST UPDATE PAYMENT STATUS SUCCESS',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open('Data berhasil diubah', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Payment Statuses
     * @memberof PaymentEffects
     */
    fetchPaymentStatusesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PaymentStatusActions.fetchPaymentStatusesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        PaymentStatusActions.fetchPaymentStatusesFailure({
                            payload: { id: 'fetchPaymentStatusesFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$paymentStatusApi.findAll(payload, supplierId).pipe(
                    catchOffline(),
                    map(resp => {
                        this._$log.generateGroup(
                            'RESPONSE REQUEST FETCH PAYMENT STATUSES',
                            {
                                payload: {
                                    type: 'log',
                                    value: payload
                                },
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            },
                            'groupCollapsed'
                        );

                        const newResp = {
                            total: resp.total,
                            data: resp.data
                        };

                        return PaymentStatusActions.fetchPaymentStatusesSuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            PaymentStatusActions.fetchPaymentStatusesFailure({
                                payload: { id: 'fetchPaymentStatusesFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Payment Statuses
     * @memberof PaymentEffects
     */
    fetchPaymentStatusesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PaymentStatusActions.fetchPaymentStatusesFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = resp.errors.error.message || resp.errors.message;

                    this._$log.generateGroup(
                        '[REQUEST FETCH PAYMENT STATUSES FAILURE]',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            },
                            message: {
                                type: 'log',
                                value: message
                            }
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ EXPORT methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Export
     * @memberof PaymentEffects
     */
    exportRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PaymentStatusActions.exportRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([_, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        PaymentStatusActions.exportFailure({
                            payload: { id: 'exportFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$downloadApi.download('export-payments', supplierId).pipe(
                    map(resp => {
                        return PaymentStatusActions.exportSuccess({
                            payload: resp.url
                        });
                    }),
                    catchError(err =>
                        of(
                            PaymentStatusActions.exportFailure({
                                payload: { id: 'exportFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Export
     * @memberof PaymentEffects
     */
    exportFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PaymentStatusActions.exportFailure),
                map(action => action.payload),
                tap(resp => {
                    let message;

                    if (resp.errors.code === 406) {
                        message = resp.errors.error.errors
                            .map(r => {
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
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [REQUEST - SUCCESS] Export
     * @memberof PaymentEffects
     */
    exportSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PaymentStatusActions.exportSuccess),
                map(action => action.payload),
                tap(url => {
                    if (url) {
                        window.open(url, '_blank');
                    }
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ IMPORT methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Import
     * @memberof PaymentEffects
     */
    importRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PaymentStatusActions.importRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([{ file, type }, { supplierId }]) => {
                if (!supplierId || !file || !type) {
                    return of(
                        PaymentStatusActions.importFailure({
                            payload: { id: 'importFailure', errors: 'Not Found!' }
                        })
                    );
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('supplierId', supplierId);
                formData.append('type', type);

                return this._$uploadApi.uploadFormData('import-order-parcels', formData).pipe(
                    map(resp => {
                        return PaymentStatusActions.importSuccess();
                    }),
                    catchError(err =>
                        of(
                            PaymentStatusActions.importFailure({
                                payload: { id: 'importFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Import
     * @memberof PaymentEffects
     */
    importFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PaymentStatusActions.importFailure),
                map(action => action.payload),
                tap(resp => {
                    let message;

                    if (resp.errors.code === 406) {
                        message = resp.errors.error.errors
                            .map(r => {
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
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [REQUEST - SUCCESS] Import
     * @memberof PaymentEffects
     */
    importSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PaymentStatusActions.importSuccess),
                tap(resp => {
                    this._$notice.open('Import berhasil', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromPaymentStatus.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$downloadApi: DownloadApiService,
        private _$paymentStatusApi: PaymentStatusApiService,
        private _$uploadApi: UploadApiService
    ) {}
}
