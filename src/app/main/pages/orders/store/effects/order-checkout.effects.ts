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
import { OrderCheckoutActions } from '../actions';
import { ProductCheckout, CreateManualOrder } from '../../models';
import * as fromAddProduct from '../reducers/add-product.reducer';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';

@Injectable()
export class OrderCheckoutEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Order Checkout
     * @memberof OrderCheckoutEffects
     */
    fetchOrderCheckoutRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderCheckoutActions.fetchCheckoutOrderRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        OrderCheckoutActions.fetchCheckoutOrderFailure({
                            payload: { id: 'fetchCheckoutOrderFailure', errors: 'Not Found!' },
                        })
                    );
                }
                return this._$orderAddApiService.checkoutProduct(payload).pipe(
                    catchOffline(),
                    map((resp) => {

                        return OrderCheckoutActions.fetchCheckoutOrderSuccess({
                            payload: resp['data']
                        });
                    }),
                    catchError((err) =>
                        of(
                            OrderCheckoutActions.fetchCheckoutOrderFailure({
                                payload: { id: 'fetchCheckoutOrderFailure', errors: err },
                            })
                        )
                    )
                );
            })
        )
    );

     /**
     *
     * [UPDATE - SUCCESS] Collection Payment Approval
     * @memberof Reject Approve Effects
     */
      fetchCheckoutOrderSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderCheckoutActions.fetchCheckoutOrderRequest),
                map((action) => action.payload),
                tap(() => {
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [REQUEST - FAILURE]  Order Checkout
     * @memberof OrderCheckoutEffects
     */
    fetchCheckoutOrderFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderCheckoutActions.fetchCheckoutOrderFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message =
                        resp.errors.error && resp.errors.error.message
                            ? resp.errors.error.message
                            : resp.errors.message;

                    this._$log.generateGroup(
                        '[REQUEST Order Checkout FAILURE]',
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
