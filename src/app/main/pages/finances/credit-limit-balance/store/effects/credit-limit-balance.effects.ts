import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { PaginateResponse } from 'app/shared/models';
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

import { CreditLimitGroup, CreditLimitStore, CreditLimitStoreOptions } from '../../models';
import {
    CreditLimitBalanceApiService,
    CreditLimitGroupApiService,
    CreditLimitStoreApiService
} from '../../services';
import { CreditLimitBalanceActions } from '../actions';
import { fromCreditLimitBalance } from '../reducers';

@Injectable()
export class CreditLimitBalanceEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [CREATE - REQUEST] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    createCreditLimitGroupRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.createCreditLimitGroupRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$creditLimitGroupApi.create(payload).pipe(
                    map(resp => {
                        this._$log.generateGroup(
                            `[RESPONSE REQUEST CREATE CREDIT LIMIT GROUP]`,
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

                        return CreditLimitBalanceActions.createCreditLimitGroupSuccess({
                            payload: resp
                        });
                    }),
                    catchError(err =>
                        of(
                            CreditLimitBalanceActions.createCreditLimitGroupFailure({
                                payload: { id: 'createCreditLimitGroupFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [CREATE - FAILURE] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    createCreditLimitGroupFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.createCreditLimitGroupFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        `[REQUEST CREATE CREDIT LIMIT GROUP FAILURE]`,
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open('Data gagal ditambah', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [CREATE - SUCCESS] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    createCreditLimitGroupSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.createCreditLimitGroupSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        `[REQUEST CREATE CREDIT LIMIT GROUP SUCCESS]`,
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open('Data berhasil ditambah', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - DIALOG] Credit Limit Store
     * @memberof CreditLimitBalanceEffects
     */
    confirmUpdateCreditLimitStore$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.confirmUpdateCreditLimitStore),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: CreditLimitStoreOptions }
                >(ChangeConfirmationComponent, {
                    data: {
                        title: 'Update Credit Limit Balance',
                        message: `Are you sure want to update <strong>${params.store.name}</strong> ?`,
                        id: params.id,
                        change: params
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(({ id, change }) => {
                if (id && change) {
                    return CreditLimitBalanceActions.updateCreditLimitStoreRequest({
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
     * [UPDATE - REQUEST] Credit Limit Store
     * @memberof CreditLimitBalanceEffects
     */
    updateCreditLimitStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.updateCreditLimitStoreRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$creditLimitStoreApi.patch(body, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(
                            `[RESPONSE REQUEST UPDATE CREDIT LIMIT STORE]`,
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

                        return CreditLimitBalanceActions.updateCreditLimitStoreSuccess({
                            payload: {
                                id,
                                changes: {
                                    ...body,
                                    updatedAt: resp.updatedAt
                                }
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            CreditLimitBalanceActions.updateCreditLimitStoreFailure({
                                payload: { id: 'updateCreditLimitStoreFailure', errors: err }
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
     * [UPDATE - FAILURE] Credit Limit Store
     * @memberof CreditLimitBalanceEffects
     */
    updateCreditLimitStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.updateCreditLimitStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        `[REQUEST UPDATE CREDIT LIMIT STORE FAILURE]`,
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
     * [UPDATE - SUCCESS] Credit Limit Store
     * @memberof CreditLimitBalanceEffects
     */
    updateCreditLimitStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.updateCreditLimitStoreSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        `[REQUEST UPDATE CREDIT LIMIT STORE SUCCESS]`,
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

    /**
     *
     * [UPDATE - DIALOG] Freeze Balance Status
     * @memberof CreditLimitBalanceEffects
     */
    confirmChangeFreezeBalanceStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.confirmChangeFreezeBalanceStatus),
            map(action => action.payload),
            exhaustMap(params => {
                const title = params.freezeStatus ? 'Unfreeze Balance' : 'Freeze Balance';
                const body = !params.freezeStatus;
                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: boolean }
                >(ChangeConfirmationComponent, {
                    data: {
                        title: title,
                        message: `Are you sure want to ${title.toLowerCase()} <strong>${
                            params.store.name
                        }</strong> ?`,
                        id: params.id,
                        change: body
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(({ id, change }) => {
                console.log('MAT DIALOG', id, change);

                if (id && typeof change === 'boolean') {
                    return CreditLimitBalanceActions.updateStatusFreezeBalanceRequest({
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
     * [UPDATE - REQUEST] Freeze Balance Status
     * @memberof CreditLimitBalanceEffects
     */
    updateStatusFreezeBalanceRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.updateStatusFreezeBalanceRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                const change = CreditLimitStore.patch({ freezeStatus: body });

                return this._$creditLimitBalanceApi.updatePatch(change, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(
                            '[RESPONSE REQUEST UPDATE STATUS FREEZE BALANCE]',
                            {
                                resp: {
                                    type: 'log',
                                    value: resp
                                }
                            }
                        );

                        return CreditLimitBalanceActions.updateStatusFreezeBalanceSuccess({
                            payload: {
                                id: id,
                                changes: {
                                    ...change,
                                    updatedAt: resp.updatedAt
                                }
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            CreditLimitBalanceActions.updateStatusFreezeBalanceFailure({
                                payload: {
                                    id: 'updateStatusFreezeBalanceFailure',
                                    errors: err
                                }
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
     * [UPDATE - FAILURE] Freeze Balance Status
     * @memberof CreditLimitBalanceEffects
     */
    updateStatusFreezeBalanceFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.updateStatusFreezeBalanceFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST UPDATE STATUS FREEZE BALANCE FAILURE]', {
                        resp: {
                            type: 'log',
                            value: resp
                        }
                    });

                    let title = 'Update Freeze/Unfreeze Balance';

                    if (typeof resp.errors.body.freezeStatus === 'boolean') {
                        title = resp.errors.body.freezeStatus
                            ? 'Freeze Balance'
                            : 'Unfreeze Balance';
                    }

                    this._$notice.open(`${title} gagal`, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Freeze Balance Status
     * @memberof CreditLimitBalanceEffects
     */
    updateStatusFreezeBalanceSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.updateStatusFreezeBalanceSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST UPDATE STATUS FREEZE BALANCE SUCCESS]', {
                        resp: {
                            type: 'log',
                            value: resp
                        }
                    });

                    const title = resp.changes.freezeStatus ? 'Freeze Balance' : 'Unfreeze Balance';

                    this._$notice.open(`${title} berhasil`, 'success', {
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
     * [REQUEST] Credit Limit Stores
     * @memberof CreditLimitBalanceEffects
     */
    fetchCreditLimitStoresRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.fetchCreditLimitStoresRequest),
            map(action => action.payload),
            // withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            // switchMap(([payload, auth]) => {
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        CreditLimitBalanceActions.fetchCreditLimitStoresFailure({
                            payload: {
                                id: 'fetchCreditLimitStoresFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                return this._$creditLimitStoreApi
                    .findAll<PaginateResponse<CreditLimitStore>>(payload, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            this._$log.generateGroup(
                                '[RESPONSE REQUEST FETCH CREDIT LIMIT STORES]',
                                {
                                    resp: {
                                        type: 'log',
                                        value: resp
                                    }
                                }
                            );

                            const newResp = {
                                total: resp.total,
                                data:
                                    resp && resp.data && resp.data.length > 0
                                        ? resp.data.map(row => {
                                              return new CreditLimitStore(
                                                  row.id,
                                                  row.storeId,
                                                  row.creditLimitGroupId,
                                                  row.creditLimit,
                                                  row.balanceAmount,
                                                  row.freezeStatus,
                                                  row.termOfPayment,
                                                  row.creditLimitStoreId,
                                                  row.creditLimitGroup,
                                                  row.store,
                                                  row.averageOrder,
                                                  row.totalOrder,
                                                  row.createdAt,
                                                  row.updatedAt,
                                                  row.deletedAt
                                              );
                                          })
                                        : []
                            };

                            return CreditLimitBalanceActions.fetchCreditLimitStoresSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                CreditLimitBalanceActions.fetchCreditLimitStoresFailure({
                                    payload: {
                                        id: 'fetchCreditLimitStoresFailure',
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
     * [REQUEST - FAILURE] Credit Limit Stores
     * @memberof CreditLimitBalanceEffects
     */
    fetchCreditLimitStoresFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.fetchCreditLimitStoresFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST FETCH CREDIT LIMIT STORES FAILURE]', {
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

    /**
     *
     * [REQUEST] Credit Limit Store
     * @memberof CreditLimitBalanceEffects
     */
    fetchCreditLimitStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.fetchCreditLimitStoreRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$creditLimitStoreApi.findById(id).pipe(
                    catchOffline(),
                    map(({ creditLimit, balanceAmount, termOfPayment }) => {
                        this._$log.generateGroup('[RESPONSE REQUEST FETCH CREDIT LIMIT STORE]', {
                            creditLimit: {
                                type: 'log',
                                value: creditLimit
                            },
                            balanceAmount: {
                                type: 'log',
                                value: balanceAmount
                            },
                            termOfPayment: {
                                type: 'log',
                                value: termOfPayment
                            }
                        });

                        const change = CreditLimitStore.patch({
                            creditLimit,
                            balanceAmount,
                            termOfPayment
                        });

                        return CreditLimitBalanceActions.fetchCreditLimitStoreSuccess({
                            payload: {
                                id,
                                data: {
                                    id,
                                    changes: change
                                }
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            CreditLimitBalanceActions.fetchCreditLimitStoreFailure({
                                payload: { id: 'fetchCreditLimitStoreFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Credit Limit Store
     * @memberof CreditLimitBalanceEffects
     */
    fetchCreditLimitStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.fetchCreditLimitStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST FETCH CREDIT LIMIT STORE FAILURE]', {
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

    fetchCreditLimitGroupsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.fetchCreditLimitGroupsRequest),
            map(action => action.payload),
            // withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            // switchMap(([payload, auth]) => {
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        CreditLimitBalanceActions.fetchCreditLimitGroupsFailure({
                            payload: {
                                id: 'fetchCreditLimitGroupsFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                return this._$creditLimitGroupApi
                    .findAll<CreditLimitGroup[]>(payload, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            this._$log.generateGroup(
                                '[RESPONSE REQUEST FETCH CREDIT LIMIT GROUPS]',
                                {
                                    resp: {
                                        type: 'log',
                                        value: resp
                                    }
                                }
                            );

                            const newCreditLimitGroup =
                                resp && resp.length > 0
                                    ? resp.map(row => {
                                          return new CreditLimitGroup(
                                              row.id,
                                              row.supplierId,
                                              row.customerHierarchyId,
                                              row.storeSegmentId,
                                              row.name,
                                              row.defaultCreditLimit,
                                              row.defaultBalanceAmount,
                                              row.termOfPayment,
                                              row.creditLimitAreas,
                                              row.storeSegment,
                                              row.createdAt,
                                              row.updatedAt,
                                              row.deletedAt
                                          );
                                      })
                                    : [];

                            return CreditLimitBalanceActions.fetchCreditLimitGroupsSuccess({
                                payload: newCreditLimitGroup
                            });
                        }),
                        catchError(err =>
                            of(
                                CreditLimitBalanceActions.fetchCreditLimitGroupsFailure({
                                    payload: {
                                        id: 'fetchCreditLimitGroupsFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchCreditLimitGroupsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.fetchCreditLimitGroupsFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST FETCH CREDIT LIMIT GROUPS FAILURE]', {
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
        private matDialog: MatDialog,
        private store: Store<fromCreditLimitBalance.FeatureState>,
        private _$log: LogService,
        private _$creditLimitBalanceApi: CreditLimitBalanceApiService,
        private _$creditLimitGroupApi: CreditLimitGroupApiService,
        private _$creditLimitStoreApi: CreditLimitStoreApiService,
        private _$notice: NoticeService
    ) {}
}
