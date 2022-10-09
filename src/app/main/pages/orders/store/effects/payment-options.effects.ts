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

import { OrderAddApiService } from '../../services';
import { PaymentOptionActions } from '../actions';
import { PaymentValidation } from '../../models';
import * as fromAddProduct from '../reducers/add-product.reducer';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';

@Injectable()
export class PaymentValidationEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Payment Validation List
     * @memberof PaymentValidationEffects
     */
    fetchPaymentStatusRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PaymentOptionActions.fetchPaymentValidRequest),
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
                        PaymentOptionActions.fetchPaymentValidFailure({
                            payload: {
                                id: 'fetchPaymentValidFailure',
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
                        PaymentOptionActions.fetchPaymentValidFailure({
                            payload: {
                                id: 'fetchPaymentValidFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                return this._$orderAddApiService.paymentValidation(params.payload.orderParcelId)
                    .pipe(
                        catchOffline(),
                        map((resp) => {
                            const newResp = {
                                data:
                                    (resp && resp.data.length > 0
                                        ? resp.data.map((v) => new PaymentValidation(v))
                                        : []) || [],
                                orderParcelId: params.payload.orderParcelId,
                                brandName: params.payload.brandName
                            };

                            return PaymentOptionActions.fetchPaymentValidSuccess({
                                payload: newResp,
                            });
                        }),
                        catchError((err) =>
                            of(
                                PaymentOptionActions.fetchPaymentValidFailure({
                                    payload: {
                                        id: 'fetchPaymentValidFailure',
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
     * [REQUEST - FAILURE] Payment Validation List
     * @memberof PaymentValidationEffects
     */
     fetchPaymentValidFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PaymentOptionActions.fetchPaymentValidFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message =
                        resp.errors.error && resp.errors.error.message
                            ? resp.errors.error.message
                            : resp.errors.message;

                    this._$log.generateGroup(
                        '[REQUEST FETCH Payment Validation List FAILURE]',
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

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private storage: StorageMap,
        private store: Store<fromAddProduct.FeatureStateAddProduct>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$orderAddApiService: OrderAddApiService
    ) {}
}
