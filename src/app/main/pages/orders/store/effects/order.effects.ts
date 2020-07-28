import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import {
    CalculateOrderApiService,
    DownloadApiService,
    LogService,
    NoticeService,
    OrderBrandCatalogueApiService,
    UploadApiService
} from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals';
import { ErrorHandler } from 'app/shared/models/global.model';
import { ProgressActions, UiActions } from 'app/shared/store/actions';
import { of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    retry,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { IStatusOMS } from '../../models';
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
                        title = 'Packed';
                        body = 'packing';
                        break;

                    case 'packing':
                        title = 'Shipped';
                        body = 'shipping';
                        break;

                    case 'shipping':
                        title = 'Delivered';
                        body = 'delivered';
                        break;

                    case 'delivered':
                        title = 'Done';
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
                    const message = resp.errors.error ? resp.errors.error.message : resp.errors.message;
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
                    const message =
                        typeof resp.errors === 'string'
                            ? resp.errors
                            : resp.errors.error.message || resp.errors.message;

                    this.router.navigate(['/pages/orders']).finally(() => {
                        this._$notice.open(message, 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    fetchCalculateOrdersRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.fetchCalculateOrdersRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then(user => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;

                return of([params, supplierId]);
            }),
            switchMap(([_, data]: [any, string | Auth]) => {
                if (!data) {
                    return of(
                        OrderActions.fetchCalculateOrdersFailure({
                            payload: {
                                id: 'fetchCalculateOrdersFailure',
                                errors: 'Not Found!'
                            }
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
                        OrderActions.fetchCalculateOrdersFailure({
                            payload: {
                                id: 'fetchCalculateOrdersFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                return this._$calculateOrderApi.getStatusOrders<IStatusOMS>('oms', supplierId).pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => {
                        return OrderActions.fetchCalculateOrdersSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            OrderActions.fetchCalculateOrdersFailure({
                                payload: {
                                    id: 'fetchCalculateOrdersFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchCalculateOrdersFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.fetchCalculateOrdersFailure),
                map(action => action.payload),
                tap(resp => {
                    const message =
                        typeof resp.errors === 'string'
                            ? resp.errors
                            : resp.errors.error.message || resp.errors.message;

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
     * @memberof OrderEffects
     */
    exportRequest$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.exportRequest),
                map(action => action.payload),
                withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
                switchMap(([filter, { supplierId }]) => {
                    if (!supplierId) {
                        return of(
                            OrderActions.exportFailure({
                                payload: { id: 'exportFailure', errors: 'Not Found!' }
                            })
                        );
                    }

                    return this._$downloadApi.download('export-orders', supplierId, filter).pipe(
                        // switchMap(resp => {
                        //     console.log('REQUEST 1', resp);

                        //     return this.http.get(resp, { reportProgress: true, observe: 'events' });

                        //     // return this._$downloadApi.handleHttpProgress(resp, 'export-order');

                        //     // return this._$downloadApi.handleHttpProgress(resp).pipe(
                        //     //     map(x => {
                        //     //         console.log('REQUEST', x);

                        //     //         return OrderActions.exportSuccess({
                        //     //             payload: x.url
                        //     //         });
                        //     //     })
                        //     // );
                        //     // const contentType = resp.headers.get('Content-Type');
                        //     // const contentDisposition = resp.headers.get('Content-Disposition');
                        //     // const fileName = contentDisposition
                        //     //     .replace(new RegExp(/;|"/g), '')
                        //     //     .split(' ')[1]
                        //     //     .split('=')[1];

                        //     // return OrderActions.exportSuccess({
                        //     //     payload: {
                        //     //         file: new Blob([resp.body], { type: contentType }),
                        //     //         name: fileName
                        //     //     }
                        //     // });

                        //     // return OrderActions.exportSuccess({
                        //     //     payload: resp.url
                        //     // });
                        // }),
                        map(resp => {
                            return OrderActions.exportSuccess({
                                payload: resp.url
                            });
                        }),
                        catchError(err =>
                            of(
                                OrderActions.exportFailure({
                                    payload: { id: 'exportFailure', errors: err }
                                })
                            )
                        )
                    );
                })
            )
        // { dispatch: false }
    );

    /**
     *
     * [REQUEST - FAILURE] Export
     * @memberof OrderEffects
     */
    exportFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.exportFailure),
                map(action => action.payload),
                tap(resp => {
                    this.store.dispatch(
                        ProgressActions.downloadFailure({
                            payload: { id: 'export-order', error: new ErrorHandler(resp) }
                        })
                    );

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
     * @memberof OrderEffects
     */
    exportSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.exportSuccess),
                map(action => action.payload),
                tap(url => {
                    if (url) {
                        window.open(url, '_blank');

                        this._$notice.open('Export berhasil', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    }
                })
                // tap(({ file, name }) => {
                //     if (file && name) {
                //         saveAs(file, name);
                //     }
                // })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ IMPORT methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Import
     * @memberof OrderEffects
     */
    importRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrderActions.importRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([{ file, type }, { supplierId }]) => {
                if (!supplierId || !file || !type) {
                    return of(
                        OrderActions.importFailure({
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
                        return OrderActions.importSuccess();
                    }),
                    catchError(err =>
                        of(
                            OrderActions.importFailure({
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
     * @memberof OrderEffects
     */
    importFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.importFailure),
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
     * @memberof OrderEffects
     */
    importSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(OrderActions.importSuccess),
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
        private storage: StorageMap,
        private store: Store<fromOrder.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$calculateOrderApi: CalculateOrderApiService,
        private _$downloadApi: DownloadApiService,
        private _$orderApi: OrderApiService,
        private _$orderBrandCatalogueApi: OrderBrandCatalogueApiService,
        private _$uploadApi: UploadApiService
    ) {}
}
