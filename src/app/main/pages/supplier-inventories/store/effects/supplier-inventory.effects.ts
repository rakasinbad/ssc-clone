import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { SupplierInventoryApiService } from '../../services/supplier-inventory-api.service';
import { SupplierInventoryActions } from '../actions';
import { fromSupplierInventory } from '../reducers';

/**
 *
 *
 * @export
 * @class SupplierInventoryEffects
 */
@Injectable()
export class SupplierInventoryEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [UPDATE - REQUEST] Supplier Inventory
     * @memberof SupplierInventoryEffects
     */
    updateSupplierInventoryRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SupplierInventoryActions.updateSupplierInventoryRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$supplierInventoryApi.patchCustom<any>(body, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[RESPONSE REQUEST UPDATE SUPPLIER INVENTORY]`, {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return SupplierInventoryActions.updateSupplierInventorySuccess({
                            payload: resp
                        });
                    }),
                    catchError(err =>
                        of(
                            SupplierInventoryActions.updateSupplierInventoryFailure({
                                payload: {
                                    id: 'updateSupplierInventoryFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [UPDATE - FAILURE] Supplier Inventory
     * @memberof SupplierInventoryEffects
     */
    updateSupplierInventoryFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SupplierInventoryActions.updateSupplierInventoryFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(`[REQUEST UPDATE SUPPLIER INVENTORY FAILURE]`, {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this._$notice.open('Data gagal diupdate', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Supplier Inventory
     * @memberof SupplierInventoryEffects
     */
    updateSupplierInventorySuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SupplierInventoryActions.updateSupplierInventorySuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(`[REQUEST UPDATE SUPPLIER INVENTORY SUCCESS]`, {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this.router.navigate(['/pages/supplier-inventories']).finally(() => {
                        this._$notice.open('Data berhasil diupdate', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
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
     * [REQUEST] Supplier Inventories
     * @memberof SupplierInventoryEffects
     */
    fetchSupplierInventoriesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SupplierInventoryActions.fetchSupplierInventoriesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        SupplierInventoryActions.fetchSupplierInventoriesFailure({
                            payload: {
                                id: 'fetchSupplierInventoriesFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                return this._$supplierInventoryApi.findAll(payload, supplierId).pipe(
                    catchOffline(),
                    map(resp => {
                        this._$log.generateGroup(
                            '[RESPONSE REQUEST FETCH SUPPLIER INVENTORIES]',
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

                        return SupplierInventoryActions.fetchSupplierInventoriesSuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            SupplierInventoryActions.fetchSupplierInventoriesFailure({
                                payload: { id: 'fetchSupplierInventoriesFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Supplier Inventories
     * @memberof SupplierInventoryEffects
     */
    fetchSupplierInventoriesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SupplierInventoryActions.fetchSupplierInventoriesFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        '[REQUEST FETCH SUPPLIER INVENTORIES FAILURE]',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open(resp.errors.error.message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [REQUEST] Supplier Iventory
     * @memberof SupplierInventoryEffects
     */
    fetchSupplierInventoryRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SupplierInventoryActions.fetchSupplierInventoryRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$supplierInventoryApi.findById(id).pipe(
                    catchOffline(),
                    map(resp => {
                        this._$log.generateGroup('[RESPONSE REQUEST FETCH SUPPLIER INVENTORY]', {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return SupplierInventoryActions.fetchSupplierInventorySuccess({
                            payload: resp
                        });
                    }),
                    catchError(err =>
                        of(
                            SupplierInventoryActions.fetchSupplierInventoryFailure({
                                payload: { id: 'fetchSupplierInventoryFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Supplier Iventory
     * @memberof SupplierInventoryEffects
     */
    fetchSupplierInventoryFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SupplierInventoryActions.fetchSupplierInventoryFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST FETCH SUPPLIER INVENTORY FAILURE]', {
                        resp: {
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
        private router: Router,
        private store: Store<fromSupplierInventory.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$supplierInventoryApi: SupplierInventoryApiService
    ) {}
}
