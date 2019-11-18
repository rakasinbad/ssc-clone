import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
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

    fetchPaymentStatusRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PaymentStatusActions.fetchPaymentStatusRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            switchMap(([payload, auth]) => {
                if (!auth.user.data.userSuppliers.length) {
                    return of(
                        PaymentStatusActions.fetchPaymentStatusFailure({
                            payload: { id: 'fetchPaymentStatusFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$paymentStatusApi
                    .findAll(payload, auth.user.data.userSuppliers[0].supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            let newResp = {
                                total: 0,
                                data: []
                            };

                            if (resp.total > 0) {
                                newResp = {
                                    total: resp.total,
                                    data: [...resp.data]
                                };
                            }

                            return PaymentStatusActions.fetchPaymentStatusSuccess({
                                payload: { paymentStatus: newResp.data, total: newResp.total }
                            });
                        }),
                        catchError(err =>
                            of(
                                PaymentStatusActions.fetchPaymentStatusFailure({
                                    payload: { id: 'fetchPaymentStatusFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchPaymentStatusFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PaymentStatusActions.fetchPaymentStatusFailure),
                map(action => action.payload),
                tap(resp => {
                    console.log('FETCH PAYMENT STATUS ERR', resp);

                    this._$notice.open(resp.errors.error.message, 'error', {
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
        private _$notice: NoticeService,
        private _$paymentStatusApi: PaymentStatusApiService
    ) {}
}
