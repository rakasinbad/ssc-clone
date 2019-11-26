import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { PaymentStatusApiService } from '../../services';
import { PaymentStatusActions } from '../actions';
import { fromPaymentStatus } from '../reducers';

@Injectable()
export class PaymentEffects {
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
                            '[RESPONSE REQUEST FETCH PAYMENT STATUSES]',
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

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromPaymentStatus.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$paymentStatusApi: PaymentStatusApiService
    ) {}
}
