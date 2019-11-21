import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { OrderApiService } from '../../services';
import { OrderActions } from '../actions';
import { fromOrder } from '../reducers';

/**
 *
 *
 * @export
 * @class OrderEffects
 */
@Injectable()
export class OrderEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Orders
     * @memberof OrderEffects
     */
    fetchOrdersRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.fetchOrdersRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        OrderActions.fetchOrdersFailure({
                            payload: { id: 'fetchOrdersFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$orderApi.findAll(payload, supplierId).pipe(
                    catchOffline(),
                    map(resp => {
                        this._$log.generateGroup('[RESPONSE REQUEST FETCH ORDERS]', {
                            payload: {
                                type: 'log',
                                value: payload
                            },
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        const newResp = {
                            total: resp.total,
                            data: resp.data
                        };

                        return OrderActions.fetchOrdersSuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            OrderActions.fetchOrdersFailure({
                                payload: { id: 'fetchOrdersFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Orders
     * @memberof OrderEffects
     */
    fetchOrdersFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.fetchOrdersFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST FETCH ORDERS FAILURE]', {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

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
        private store: Store<fromOrder.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$orderApi: OrderApiService
    ) {}
}
