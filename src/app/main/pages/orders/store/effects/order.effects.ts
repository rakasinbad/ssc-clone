import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService, OrderBrandCatalogueApiService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { UiActions } from 'app/shared/store/actions';
import { of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

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
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [UPDATE - REQUEST] Delivered Qty
     * @memberof OrderEffects
     */
    updateDeliveredQtyRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.updateDeliveredQtyRequest),
            map(action => action.payload),
            switchMap(({ id, body }) => {
                return this._$orderBrandCatalogueApi.patch({ deliveredQty: body }, id).pipe(
                    map(resp => {
                        this._$log.generateGroup('RESPONSE REQUEST UPDATE DELIVERED QTY', {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return OrderActions.updateDeliveredQtySuccess();
                    }),
                    catchError(err =>
                        of(
                            OrderActions.updateDeliveredQtyFailure({
                                payload: { id: 'updateDeliveredQtyFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [UPDATE - FAILURE] Delivered Qty
     * @memberof OrderEffects
     */
    updateDeliveredQtyFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.updateDeliveredQtyFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('REQUEST UPDATE DELIVERED QTY FAILURE', {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this._$notice.open('Update delivered qty gagal', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Delivered Qty
     * @memberof OrderEffects
     */
    updateDeliveredQtySuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.updateDeliveredQtySuccess),
                tap(resp => {
                    this._$log.generateGroup('REQUEST UPDATE DELIVERED QTY SUCCESS', {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this._$notice.open('Update delivered qty berhasil', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - REQUEST] Invoiced Qty
     * @memberof OrderEffects
     */
    updateInvoicedQtyRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.updateInvoicedQtyRequest),
            map(action => action.payload),
            switchMap(({ id, body }) => {
                return this._$orderBrandCatalogueApi.patch({ invoicedQty: body }, id).pipe(
                    map(resp => {
                        this._$log.generateGroup('RESPONSE REQUEST UPDATE INVOICED QTY', {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return OrderActions.updateInvoicedQtySuccess();
                    }),
                    catchError(err =>
                        of(
                            OrderActions.updateInvoicedQtyFailure({
                                payload: { id: 'updateInvoicedQtyFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [UPDATE - FAILURE] Invoiced Qty
     * @memberof OrderEffects
     */
    updateInvoicedQtyFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.updateInvoicedQtyFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('REQUEST UPDATE INVOICED QTY FAILURE', {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this._$notice.open('Update invoiced qty gagal', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Invoiced Qty
     * @memberof OrderEffects
     */
    updateInvoicedQtySuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.updateInvoicedQtySuccess),
                tap(resp => {
                    this._$log.generateGroup('REQUEST UPDATE INVOICED QTY SUCCESS', {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this._$notice.open('Update invoiced qty berhasil', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - DIALOG] Cancel Status Order
     * @memberof OrderEffects
     */
    confirmChangeCancelStatusOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.confirmChangeCancelStatusOrder),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: string }
                >(ChangeConfirmationComponent, {
                    data: {
                        title: 'Set Cancel',
                        message: `Are you sure want to cancel <strong>${params.orderCode}</strong> ?`,
                        id: params.id,
                        change: 'cancel'
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(({ id, change }) => {
                if (id && change) {
                    return OrderActions.updateCancelStatusRequest({
                        payload: { id, body: change }
                    });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    /**
     *
     * [UPDATE - REQUEST] Cancel Status Order
     * @memberof OrderEffects
     */
    updateCancelStatusRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.updateCancelStatusRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                const change = { status: body };

                return this._$orderApi.patch(change, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(
                            'RESPONSE REQUEST UPDATE CANCEL STATUS ORDER',
                            {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            },
                            'groupCollapsed'
                        );

                        return OrderActions.updateCancelStatusSuccess({
                            payload: {
                                id,
                                changes: {
                                    ...change,
                                    updatedAt: resp.updatedAt
                                }
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            OrderActions.updateCancelStatusFailure({
                                payload: { id: 'updateCancelStatusFailure', errors: err }
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
     * [UPDATE - FAILURE] Cancel Status Order
     * @memberof OrderEffects
     */
    updateCancelStatusFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.updateCancelStatusFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST UPDATE CANCEL STATUS ORDER FAILURE',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open('Update status gagal', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Cancel Status Order
     * @memberof OrderEffects
     */
    updateCancelStatusSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.updateCancelStatusSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('REQUEST UPDATE CANCEL STATUS ORDER SUCCESS', {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this._$notice.open('Update status berhasil', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - DIALOG] Status Order
     * @memberof OrderEffects
     */
    confirmChangeStatusOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.confirmChangeStatusOrder),
            map(action => action.payload),
            exhaustMap(params => {
                let title: string;
                let body: string;

                switch (params.status) {
                    case 'confirm':
                        title = 'Dikemas';
                        body = 'packing';
                        break;

                    case 'packing':
                        title = 'Dikirim';
                        body = 'shipping';
                        break;

                    case 'shipping':
                        title = 'Diterima';
                        body = 'delivered';
                        break;

                    case 'delivered':
                        title = 'Selesai';
                        body = 'done';
                        break;
                }

                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: string }
                >(ChangeConfirmationComponent, {
                    data: {
                        title: `Set ${title}`,
                        message: `Are you sure want to change <strong>${params.orderCode}</strong> status ?`,
                        id: params.id,
                        change: body
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(({ id, change }) => {
                if (id && change) {
                    return OrderActions.updateStatusOrderRequest({
                        payload: { id, body: change }
                    });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    /**
     *
     * [UPDATE - REQUEST] Status Order
     * @memberof OrderEffects
     */
    updateStatusOrderRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.updateStatusOrderRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                const change = { status: body };

                return this._$orderApi.patch(change, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[RESPONSE REQUEST UPDATE STATUS ORDER]`, {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return OrderActions.updateStatusOrderSuccess({
                            payload: {
                                id,
                                changes: {
                                    ...change,
                                    updatedAt: resp.updatedAt
                                }
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            OrderActions.updateStatusOrderFailure({
                                payload: { id: 'updateStatusOrderFailure', errors: err }
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
     * [UPDATE - FAILURE] Status Order
     * @memberof OrderEffects
     */
    updateStatusOrderFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.updateStatusOrderFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST UPDATE STATUS ORDER FAILURE]', {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this._$notice.open('Update status gagal', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Status Order
     * @memberof OrderEffects
     */
    updateStatusOrderSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.updateStatusOrderSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST UPDATE STATUS ORDER SUCCESS]', {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this._$notice.open('Update status berhasil', 'success', {
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
                    const message = resp.errors.error.message || resp.errors.message;

                    this._$log.generateGroup('[REQUEST FETCH ORDERS FAILURE]', {
                        response: {
                            type: 'log',
                            value: resp
                        },
                        message: {
                            type: 'log',
                            value: message
                        }
                    });

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
     * [REQUEST] Order
     * @memberof OrderEffects
     */
    fetchOrderRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.fetchOrderRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$orderApi.findById(id).pipe(
                    catchOffline(),
                    map(resp => {
                        this._$log.generateGroup('[RESPONSE REQUEST FETCH ORDER]', {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return OrderActions.fetchOrderSuccess({
                            payload: resp
                        });
                    }),
                    catchError(err =>
                        of(
                            OrderActions.fetchOrderFailure({
                                payload: { id: 'fetchOrderFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Order
     * @memberof OrderEffects
     */
    fetchOrderFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.fetchOrderFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = resp.errors.error.message || resp.errors.message;

                    this._$log.generateGroup('[REQUEST FETCH ORDER FAILURE]', {
                        response: {
                            type: 'log',
                            value: resp
                        },
                        message: {
                            type: 'log',
                            value: message
                        }
                    });

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
        private store: Store<fromOrder.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$orderApi: OrderApiService,
        private _$orderBrandCatalogueApi: OrderBrandCatalogueApiService
    ) {}
}
