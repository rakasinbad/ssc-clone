import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
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
                            'RESPONSE REQUEST CREATE CREDIT LIMIT GROUP',
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
                        'REQUEST CREATE CREDIT LIMIT GROUP FAILURE',
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
                        'REQUEST CREATE CREDIT LIMIT GROUP SUCCESS',
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
     * [DELETE - DIALOG] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    confirmDeleteCreditLimitGroup$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.confirmDeleteCreditLimitGroup),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(
                    DeleteConfirmationComponent,
                    {
                        data: {
                            title: 'Delete',
                            message: `Are you sure want to delete <strong>${params.name}</strong> ?`,
                            id: params.id
                        },
                        disableClose: true
                    }
                );

                return dialogRef.afterClosed();
            }),
            map(id => {
                if (id) {
                    return CreditLimitBalanceActions.deleteCreditLimitGroupRequest({ payload: id });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    /**
     *
     * [DELETE - REQUEST] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    deleteCreditLimitGroupRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.deleteCreditLimitGroupRequest),
            map(action => action.payload),
            switchMap(params => {
                return this._$creditLimitGroupApi.delete(params).pipe(
                    map(({ id }) => {
                        this._$log.generateGroup(
                            'RESPONSE REQUEST DELETE CREDIT LIMIT GROUP',
                            {
                                response: {
                                    type: 'log',
                                    value: id
                                }
                            },
                            'groupCollapsed'
                        );

                        return CreditLimitBalanceActions.deleteCreditLimitGroupSuccess({
                            payload: id
                        });
                    }),
                    catchError(err =>
                        of(
                            CreditLimitBalanceActions.deleteCreditLimitGroupFailure({
                                payload: { id: 'deleteCreditLimitGroupSuccess', errors: err }
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
     * [DELETE - FAILURE] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    deleteCreditLimitGroupFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.deleteCreditLimitGroupFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST DELETE CREDIT LIMIT GROUP FAILURE',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open('Data gagal dihapus', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [DELETE - SUCCESS] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    deleteCreditLimitGroupSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.deleteCreditLimitGroupSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST DELETE CREDIT LIMIT GROUP SUCCESS',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open('Data berhasil dihapus', 'success', {
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
                            '[RESPONSE REQUEST] UPDATE CREDIT LIMIT STORE',
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
                        'REQUEST UPDATE CREDIT LIMIT STORE FAILURE',
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
                        'REQUEST UPDATE CREDIT LIMIT STORE SUCCESS',
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
     * [UPDATE - REQUEST] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    updateCreditLimitGroupRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.updateCreditLimitGroupRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                this._$log.generateGroup(
                    'UPDATE CREDIT LIMIT GROUP',
                    {
                        payload: {
                            type: 'log',
                            value: body
                        }
                    },
                    'groupCollapsed'
                );

                return this._$creditLimitGroupApi.patch(body, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(
                            'RESPONSE REQUEST UPDATE CREDIT LIMIT GROUP',
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

                        const newResp = new CreditLimitGroup(
                            resp.id,
                            resp.supplierId,
                            resp.hierarchyId,
                            resp.storeSegmentId,
                            resp.name,
                            resp.defaultCreditLimit,
                            resp.defaultBalanceAmount,
                            resp.termOfPayment,
                            resp.creditLimitAreas,
                            resp.storeSegment,
                            resp.createdAt,
                            resp.updatedAt,
                            resp.deletedAt
                        );

                        return CreditLimitBalanceActions.updateCreditLimitGroupSuccess({
                            payload: {
                                id,
                                changes: newResp
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            CreditLimitBalanceActions.updateCreditLimitGroupFailure({
                                payload: { id: 'updateCreditLimitGroupFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [UPDATE - FAILURE] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    updateCreditLimitGroupFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.updateCreditLimitGroupFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST UPDATE CREDIT LIMIT GROUP FAILURE',
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
     * [UPDATE - SUCCESS] Credit Limit Group
     * @memberof CreditLimitBalanceEffects
     */
    updateCreditLimitGroupSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.updateCreditLimitGroupSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST UPDATE CREDIT LIMIT GROUP SUCCESS',
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
                            'RESPONSE REQUEST UPDATE STATUS FREEZE BALANCE',
                            {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            },
                            'groupCollapsed'
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
                    this._$log.generateGroup(
                        'REQUEST UPDATE STATUS FREEZE BALANCE FAILURE',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

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
                    this._$log.generateGroup(
                        'REQUEST UPDATE STATUS FREEZE BALANCE SUCCESS',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

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
                                '[RESPONSE REQUEST] FETCH CREDIT LIMIT STORES',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                },
                                'groupCollapsed'
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
                    this._$log.generateGroup(
                        'REQUEST FETCH CREDIT LIMIT STORES FAILURE',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    const message = resp.errors.error.message || resp.errors.message;

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
                        this._$log.generateGroup(
                            'RESPONSE REQUEST FETCH CREDIT LIMIT STORE',
                            {
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
                            },
                            'groupCollapsed'
                        );

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
                    this._$log.generateGroup(
                        'REQUEST FETCH CREDIT LIMIT STORE FAILURE',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    const message = resp.errors.error.message || resp.errors.message;

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
     *
     * @memberof CreditLimitBalanceEffects
     */
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
                                'RESPONSE REQUEST FETCH CREDIT LIMIT GROUPS',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                },
                                'groupCollapsed'
                            );

                            const newCreditLimitGroup =
                                resp && resp.length > 0
                                    ? resp.map(row => {
                                          return new CreditLimitGroup(
                                              row.id,
                                              row.supplierId,
                                              row.hierarchyId,
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

    /**
     *
     * [REQUEST] Credit Limit Groups
     * @memberof CreditLimitBalanceEffects
     */
    fetchCreditLimitGroupsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CreditLimitBalanceActions.fetchCreditLimitGroupsFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST FETCH CREDIT LIMIT GROUPS FAILURE',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    const message = resp.errors.error.message || resp.errors.message;

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    fetchCreditLimitGroupRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CreditLimitBalanceActions.fetchCreditLimitGroupRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$creditLimitGroupApi.findById(id).pipe(
                    catchOffline(),
                    map(resp => {
                        this._$log.generateGroup(
                            'RESPONSE REQUEST FETCH CREDIT LIMIT GROUP',
                            {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            },
                            'groupCollapsed'
                        );

                        return CreditLimitBalanceActions.fetchCreditLimitGroupSuccess({
                            payload: {
                                id,
                                data: {
                                    id,
                                    changes: resp
                                }
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            CreditLimitBalanceActions.fetchCreditLimitGroupFailure({
                                payload: { id: 'fetchCreditLimitGroupFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
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
