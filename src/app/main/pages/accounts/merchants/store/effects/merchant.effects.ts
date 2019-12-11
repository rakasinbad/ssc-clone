import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService, StoreApiService, UserApiService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { PaginateResponse, SupplierStore, TStatus, User } from 'app/shared/models';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { getParams } from 'app/store/app.reducer';
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

import { Store as Merchant, UserStore } from '../../models';
import { MerchantApiService, MerchantEmployeeApiService } from '../../services';
import { StoreActions } from '../actions';
import { fromMerchant } from '../reducers';

@Injectable()
export class MerchantEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [CREATE - REQUEST] Store
     * @memberof MerchantEffects
     */
    createStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.createStoreRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$storeApi.create(payload).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[RESPONSE REQUEST CREATE STORE]`, {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return StoreActions.createStoreSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            StoreActions.createStoreFailure({
                                payload: { id: 'createStoreFailure', errors: err }
                            })
                        )
                    ),
                    finalize(() => {
                        this.store.dispatch(FormActions.resetClickSaveButton());
                    })
                );
            })
        )
    );

    /**
     *
     * [CREATE - FAILURE] Store
     * @memberof MerchantEffects
     */
    createStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.createStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    // console.log('GAGAL CREATE STORE', resp);

                    this._$log.generateGroup(`[REQUEST CREATE STORE FAILURE]`, {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

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
     * [CREATE - SUCCESS] Store
     * @memberof MerchantEffects
     */
    createStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.createStoreSuccess),
                map(action => action.payload),
                tap(resp => {
                    this.router.navigate(['/pages/account/stores']).finally(() => {
                        this._$notice.open(`${resp.name} berhasil ditambah`, 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - REQUEST] Store
     * @memberof MerchantEffects
     */
    updateStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.updateStoreRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$storeApi.patchCustom<any>(body, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[RESPONSE REQUEST UPDATE STORE]`, {
                            response: {
                                type: 'log',
                                value: resp
                            },
                            payload: {
                                type: 'log',
                                value: body
                            }
                        });

                        return StoreActions.updateStoreSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            StoreActions.updateStoreFailure({
                                payload: { id: 'updateStoreFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [UPDATE - FAILURE] Store
     * @memberof MerchantEffects
     */
    updateStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.updateStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(`[REQUEST UPDATE STORE FAILURE]`, {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

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
     * [UPDATE - SUCCESS] Store
     * @memberof MerchantEffects
     */
    updateStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.updateStoreSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(`[REQUEST UPDATE STORE SUCCESS]`, {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

                    this.router.navigate(['/pages/account/stores']).finally(() => {
                        this._$notice.open('Data berhasil diubah', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [DELETE - DIALOG] Store
     * @memberof MerchantEffects
     */
    confirmDeleteStore$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.confirmDeleteStore),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(
                    DeleteConfirmationComponent,
                    {
                        data: {
                            title: 'Delete',
                            message: `Are you sure want to delete <strong>${params.store.name}</strong> ?`,
                            id: params.id
                        },
                        disableClose: true
                    }
                );

                return dialogRef.afterClosed();
            }),
            map(id => {
                if (id) {
                    return StoreActions.deleteStoreRequest({ payload: id });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    /**
     *
     * [DELETE - REQUEST] Store
     * @memberof MerchantEffects
     */
    deleteStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.deleteStoreRequest),
            map(action => action.payload),
            switchMap(params => {
                return this._$merchantApi.delete<UserStore>(params).pipe(
                    map(({ id }) => {
                        this._$log.generateGroup('[RESPONSE REQUEST DELETE STORE]', {
                            resp: {
                                type: 'log',
                                value: id
                            }
                        });

                        return StoreActions.deleteStoreSuccess({ payload: id });
                    }),
                    catchError(err =>
                        of(
                            StoreActions.deleteStoreFailure({
                                payload: { id: 'deleteStoreFailure', errors: err }
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
     * [DELETE - FAILURE] Store
     * @memberof MerchantEffects
     */
    deleteStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.deleteStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST DELETE STORE FAILURE]', {
                        resp: {
                            type: 'log',
                            value: resp
                        }
                    });

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
     * [DELETE - SUCCESS] Store
     * @memberof MerchantEffects
     */
    deleteStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.deleteStoreSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST DELETE STORE SUCCESS]', {
                        resp: {
                            type: 'log',
                            value: resp
                        }
                    });

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
     * [UPDATE - DIALOG] Status Store
     * @memberof MerchantEffects
     */
    confirmCangeStatusStore$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.confirmChangeStatusStore),
            map(action => action.payload),
            exhaustMap(params => {
                const title = params.status === 'active' ? 'Inactive' : 'Active';
                const body = params.status === 'active' ? 'inactive' : 'active';
                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: TStatus }
                >(ChangeConfirmationComponent, {
                    data: {
                        title: `Set ${title}`,
                        message: `Are you sure want to change <strong>${params.store.name}</strong> status ?`,
                        id: params.id,
                        change: body
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(({ id, change }) => {
                if (id && change) {
                    return StoreActions.updateStatusStoreRequest({ payload: { id, body: change } });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    /**
     *
     * [UPDATE - REQUEST] Status Store
     * @memberof MerchantEffects
     */
    updateStatusStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.updateStatusStoreRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                const change = SupplierStore.patch({ status: body });

                return this._$merchantApi.patch<UserStore>(change, id).pipe(
                    map(resp => {
                        this._$log.generateGroup('[RESPONSE REQUEST UPDATE STATUS STORE]', {
                            resp: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return StoreActions.updateStatusStoreSuccess({
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
                            StoreActions.updateStatusStoreFailure({
                                payload: { id: 'updateStatusStoreFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [UPDATE - FAILURE] Status Store
     * @memberof MerchantEffects
     */
    updateStatusStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.updateStatusStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST UPDATE STATUS STORE FAILURE]', {
                        resp: {
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
     * [UPDATE - SUCCESS] Status Store
     * @memberof MerchantEffects
     */
    updateStatusStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.updateStatusStoreSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST UPDATE STATUS STORE SUCCESS]', {
                        resp: {
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
     * [UPDATE - REQUEST] Store Employee
     * @memberof MerchantEffects
     */
    updateStoreEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.updateStoreEmployeeRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$userApi
                    .patchCustom<{ fullName?: string; roles?: number[]; mobilePhoneNo?: string }>(
                        body,
                        id
                    )
                    .pipe(
                        map(resp => {
                            this._$log.generateGroup(`[RESPONSE REQUEST UPDATE EMPLOYEE]`, {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            this.store.dispatch(StoreActions.goPage({ payload: 'employee' }));

                            return StoreActions.updateStoreEmployeeSuccess({ payload: resp });
                        }),
                        catchError(err =>
                            of(
                                StoreActions.updateStoreEmployeeFailure({
                                    payload: { id: 'updateStoreEmployeeFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    /**
     *
     * [UPDATE - FAILURE] Store Employee
     * @memberof MerchantEffects
     */
    updateStoreEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.updateStoreEmployeeFailure),
                map(action => action.payload),
                withLatestFrom(this.store.select(getParams)),
                tap(([resp, params]) => {
                    const { storeId } = params;

                    this._$log.generateGroup(`[REQUEST UPDATE STORE EMPLOYEE FAILURE]`, {
                        response: {
                            type: 'log',
                            value: resp
                        },
                        params: {
                            type: 'log',
                            value: params
                        }
                    });

                    this._$notice.open('Data gagal diupdate', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    // this.router
                    //     .navigate(['/pages/account/stores', storeId, 'detail'])
                    //     .finally(() => {
                    //         this._$notice.open('Data berhasil diupdate', 'success', {
                    //             verticalPosition: 'bottom',
                    //             horizontalPosition: 'right'
                    //         });
                    //     });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE - SUCCESS] Store Employee
     * @memberof MerchantEffects
     */
    updateStoreEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.updateStoreEmployeeSuccess),
                map(action => action.payload),
                withLatestFrom(this.store.select(getParams)),
                tap(([resp, params]) => {
                    const { storeId } = params;

                    this.router
                        .navigate(['/pages/account/stores', storeId, 'detail'])
                        .finally(() => {
                            this._$notice.open('Data berhasil diupdate', 'success', {
                                verticalPosition: 'bottom',
                                horizontalPosition: 'right'
                            });
                        });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [DELETE - DIALOG] Employee
     * @memberof MerchantEffects
     */
    confirmDeleteStoreEmployee$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.confirmDeleteStoreEmployee),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(
                    DeleteConfirmationComponent,
                    {
                        data: {
                            title: 'Delete',
                            message: `Are you sure want to delete <strong>${params.user.fullName}</strong> ?`,
                            id: params.id
                        },
                        disableClose: true
                    }
                );

                return dialogRef.afterClosed();
            }),
            map(id => {
                this._$log.generateGroup(`[REQUEST CONFIRM DELETE STORE EMPLOYEE]`, {
                    id: {
                        type: 'log',
                        value: id
                    }
                });

                if (id) {
                    return StoreActions.deleteStoreEmployeeRequest({ payload: id });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    /**
     *
     * [DELETE - REQUEST] Employee
     * @memberof MerchantEffects
     */
    deleteStoreEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.deleteStoreEmployeeRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$merchantEmployeeApi.delete(id).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[RESPONSE REQUEST DELETE STORE EMPLOYEE]`, {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return StoreActions.deleteStoreEmployeeSuccess({ payload: id });
                    }),
                    catchError(err =>
                        of(
                            StoreActions.deleteStoreEmployeeFailure({
                                payload: { id: 'deleteStoreEmployeeFailure', errors: err }
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
     * [DELETE - FAILURE] Employee
     * @memberof MerchantEffects
     */
    deleteStoreEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.deleteStoreEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(`[REQUEST DELETE STORE EMPLOYEE FAILURE]`, {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

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
     * [DELETE - SUCCESS] Employee
     * @memberof MerchantEffects
     */
    deleteStoreEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.deleteStoreEmployeeSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(`[REQUEST DELETE STORE EMPLOYEE SUCCESS]`, {
                        response: {
                            type: 'log',
                            value: resp
                        }
                    });

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
     * [UPDATE - DIALOG] Status Employee
     * @memberof MerchantEffects
     */
    confirmChangeStatusEmployeeStore$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.confirmChangeStatusStoreEmployee),
            map(action => action.payload),
            exhaustMap(params => {
                const title = params.status === 'active' ? 'Inactive' : 'Active';
                const body = params.status === 'active' ? 'inactive' : 'active';
                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: TStatus }
                >(ChangeConfirmationComponent, {
                    data: {
                        title: `Set ${title}`,
                        message: `Are you sure want to change <strong>${params.user.fullName}</strong> status ?`,
                        id: params.id,
                        change: body
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(({ id, change }) => {
                if (id && change) {
                    return StoreActions.updateStatusStoreEmployeeRequest({
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
     * [UPDATE - REQUEST] Status Employee
     * @memberof MerchantEffects
     */
    updateStatusStoreEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.updateStatusStoreEmployeeRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                const change = UserStore.patch({ status: body });

                return this._$merchantEmployeeApi.patch(change, id).pipe(
                    map(resp => {
                        return StoreActions.updateStatusStoreEmployeeSuccess({
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
                            StoreActions.updateStatusStoreEmployeeFailure({
                                payload: { id: 'updateStatusStoreEmployeeFailure', errors: err }
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
     * [UPDATE - FAILURE] Status Employee
     * @memberof MerchantEffects
     */
    updateStatusStoreEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.updateStatusStoreEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST UPDATE STATUS STORE EMPLOYEE FAILURE]', {
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
     * [UPDATE - SUCCESS] Status Employee
     * @memberof MerchantEffects
     */
    updateStatusStoreEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.updateStatusStoreEmployeeSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup('[REQUEST UPDATE STATUS STORE EMPLOYEE SUCCESS]', {
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

    // createStoreRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.createStoreRequest),
    //         map(action => action.payload),
    //         switchMap(payload =>
    //             this._$merchantApi.createStore(payload).pipe(
    //                 map(resp => BrandStoreActions.createStoreSuccess({ payload: resp })),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.createStoreFailure({
    //                             payload: { id: 'createStoreFailure', errors: err }
    //                         })
    //                     )
    //                 ),
    //                 finalize(() => {
    //                     this.store.dispatch(FormActions.resetClickSaveButton());
    //                 })
    //             )
    //         )
    //     )
    // );

    // createStoreFailure$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.createStoreFailure),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 console.log('GAGAL CREATE STORE', resp);
    //                 this._$notice.open('Data gagal dibuat', 'error', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // createStoreSuccess$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.createStoreSuccess),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this.router.navigate(['/pages/account/stores']).finally(() => {
    //                     this._$notice.open(`${resp.name} berhasil ditambah`, 'success', {
    //                         verticalPosition: 'bottom',
    //                         horizontalPosition: 'right'
    //                     });
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // updateStoreRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.updateStoreRequest),
    //         map(action => action.payload),
    //         switchMap(({ body, id }) =>
    //             this._$merchantApi.updatePatchStore(body, id).pipe(
    //                 map(resp => {
    //                     this._$log.generateGroup(`[UPDATE RESPONSE STORE]`, {
    //                         response: {
    //                             type: 'log',
    //                             value: resp
    //                         }
    //                     });

    //                     return BrandStoreActions.updateStoreSuccess({ payload: resp });
    //                 }),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.updateStoreFailure({
    //                             payload: { id: 'updateStoreFailure', errors: err }
    //                         })
    //                     )
    //                 )
    //             )
    //         )
    //     )
    // );

    // updateStoreSuccess$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.updateStoreSuccess),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this.router.navigate(['/pages/account/stores']).finally(() => {
    //                     this._$notice.open('Data berhasil diubah', 'success', {
    //                         verticalPosition: 'bottom',
    //                         horizontalPosition: 'right'
    //                     });
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // confirmDeleteStore$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.confirmDeleteStore),
    //             map(action => action.payload),
    //             exhaustMap(params => {
    //                 const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
    //                     data: {
    //                         title: 'Delete',
    //                         message: `Are you sure want to delete <strong>${params.store.name}</strong> ?`,
    //                         id: params.id
    //                     },
    //                     disableClose: true
    //                 });

    //                 return dialogRef.afterClosed();
    //             }),
    //             map(resp => {
    //                 if (resp) {
    //                     this.store.dispatch(
    //                         BrandStoreActions.deleteStoreRequest({ payload: resp })
    //                     );
    //                 } else {
    //                     this.store.dispatch(UiActions.resetHighlightRow());
    //                 }
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // deleteStoreRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.deleteStoreRequest),
    //         map(action => action.payload),
    //         switchMap(id => {
    //             return this._$merchantApi.deleteStore(id).pipe(
    //                 map(resp => BrandStoreActions.deleteStoreSuccess({ payload: resp.id })),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.deleteStoreFailure({
    //                             payload: { id: 'deleteStoreFailure', errors: err }
    //                         })
    //                     )
    //                 ),
    //                 finalize(() => {
    //                     this.store.dispatch(UiActions.resetHighlightRow());
    //                 })
    //             );
    //         })
    //     )
    // );

    // deleteStoreFailure$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.deleteStoreFailure),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open('Data gagal dihapus', 'error', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // deleteStoreSuccess$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.deleteStoreSuccess),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open('Data berhasil dihapus', 'success', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // confirmChangeStatusStore$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.confirmChangeStatusStore),
    //             map(action => action.payload),
    //             exhaustMap(params => {
    //                 const title = params.status === 'active' ? 'Inactive' : 'Active';
    //                 const body = params.status === 'active' ? 'inactive' : 'active';
    //                 const dialogRef = this.matDialog.open(ChangeConfirmationComponent, {
    //                     data: {
    //                         title: `Set ${title}`,
    //                         message: `Are you sure want to change <strong>${params.store.name}</strong> status ?`,
    //                         id: params.id,
    //                         change: body
    //                     },
    //                     disableClose: true
    //                 });

    //                 return dialogRef.afterClosed();
    //             }),
    //             map(({ id, change }) => {
    //                 if (id && change) {
    //                     this.store.dispatch(
    //                         BrandStoreActions.updateStatusStoreRequest({
    //                             payload: { body: change, id: id }
    //                         })
    //                     );
    //                 } else {
    //                     this.store.dispatch(UiActions.resetHighlightRow());
    //                 }
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // updateStatusStoreRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.updateStatusStoreRequest),
    //         map(action => action.payload),
    //         switchMap(({ body, id }) => {
    //             return this._$merchantApi.updatePatchStatusStore({ status: body }, id).pipe(
    //                 map(resp => {
    //                     this._$log.generateGroup(`[UPDATE STATUS RESPONSE STORE]`, {
    //                         response: {
    //                             type: 'log',
    //                             value: resp
    //                         }
    //                     });

    //                     return BrandStoreActions.updateStatusStoreSuccess({ payload: resp });
    //                 }),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.updateStatusStoreFailure({
    //                             payload: { id: 'updateStatusStoreFailure', errors: err }
    //                         })
    //                     )
    //                 ),
    //                 finalize(() => {
    //                     this.store.dispatch(UiActions.resetHighlightRow());
    //                 })
    //             );
    //         })
    //     )
    // );

    // updateStatusStoreFailure$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.updateStatusStoreFailure),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open('Update status gagal', 'error', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // updateStatusStoreSuccess$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.updateStatusStoreSuccess),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open('Update status berhasil', 'success', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // updateStoreEmployeeRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.updateStoreEmployeeRequest),
    //         map(action => action.payload),
    //         switchMap(({ body, id }) => {
    //             return this._$merchantApi.updatePatchEmployee(body, id).pipe(
    //                 map(resp => {
    //                     this._$log.generateGroup(`[UPDATE RESPONSE EMPLOYEE]`, {
    //                         response: {
    //                             type: 'log',
    //                             value: resp
    //                         }
    //                     });

    //                     this.store.dispatch(BrandStoreActions.goPage({ payload: 'employee' }));

    //                     return BrandStoreActions.updateStoreEmployeeSuccess({ payload: resp });
    //                 }),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.updateStoreEmployeeFailure({
    //                             payload: { id: 'updateStoreEmployeeFailure', errors: err }
    //                         })
    //                     )
    //                 )
    //             );
    //         })
    //     )
    // );

    // updateStoreEmployeeSuccess$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.updateStoreEmployeeSuccess),
    //             map(action => action.payload),
    //             withLatestFrom(this.store.select(getParams)),
    //             tap(([resp, params]) => {
    //                 const { storeId } = params;
    //                 this.router
    //                     .navigate(['/pages/account/stores', storeId, 'detail'])
    //                     .finally(() => {
    //                         this._$notice.open('Data berhasil diupdate', 'success', {
    //                             verticalPosition: 'bottom',
    //                             horizontalPosition: 'right'
    //                         });
    //                     });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // confirmDeleteStoreEmployee$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.confirmDeleteStoreEmployee),
    //             map(action => action.payload),
    //             exhaustMap(params => {
    //                 const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
    //                     data: {
    //                         title: 'Delete',
    //                         message: `Are you sure want to delete <strong>${params.user.fullName}</strong> ?`,
    //                         id: params.id
    //                     },
    //                     disableClose: true
    //                 });

    //                 return dialogRef.afterClosed();
    //             }),
    //             map(resp => {
    //                 console.log('CONFIRM DELETE', resp);

    //                 if (resp) {
    //                     this.store.dispatch(
    //                         BrandStoreActions.deleteStoreEmployeeRequest({ payload: resp })
    //                     );
    //                 } else {
    //                     this.store.dispatch(UiActions.resetHighlightRow());
    //                 }
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // deleteStoreEmployeeRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.deleteStoreEmployeeRequest),
    //         map(action => action.payload),
    //         switchMap(id => {
    //             return this._$merchantApi.deleteEmployee(id).pipe(
    //                 map(resp => {
    //                     console.log('RESP', resp);

    //                     return BrandStoreActions.deleteStoreEmployeeSuccess({ payload: resp });
    //                 }),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.deleteStoreEmployeeFailure({
    //                             payload: { id: 'deleteStoreEmployeeFailure', errors: err }
    //                         })
    //                     )
    //                 ),
    //                 finalize(() => {
    //                     this.store.dispatch(UiActions.resetHighlightRow());
    //                 })
    //             );
    //         })
    //     )
    // );

    // deleteStoreEmployeeFailure$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.deleteStoreEmployeeFailure),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 console.log('DELETE STORE EMPLOYEE ERR', resp);

    //                 this._$notice.open('Data gagal dihapus', 'error', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // deleteStoreEmployeeSuccess$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.deleteStoreEmployeeSuccess),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 console.log('DELETE STORE EMPLOYEE', resp);

    //                 this._$notice.open('Data berhasil dihapus', 'success', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // confirmChangeStatusEmployeeStore$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.confirmChangeStatusStoreEmployee),
    //             map(action => action.payload),
    //             exhaustMap(params => {
    //                 const title = params.status === 'active' ? 'Inactive' : 'Active';
    //                 const body = params.status === 'active' ? 'inactive' : 'active';
    //                 const dialogRef = this.matDialog.open(ChangeConfirmationComponent, {
    //                     data: {
    //                         title: `Set ${title}`,
    //                         message: `Are you sure want to change <strong>${params.user.fullName}</strong> status ?`,
    //                         id: params.id,
    //                         change: body
    //                     },
    //                     disableClose: true
    //                 });

    //                 return dialogRef.afterClosed();
    //             }),
    //             map(({ id, change }) => {
    //                 if (id && change) {
    //                     this.store.dispatch(
    //                         BrandStoreActions.updateStatusStoreEmployeeRequest({
    //                             payload: { body: change, id: id }
    //                         })
    //                     );
    //                 } else {
    //                     this.store.dispatch(UiActions.resetHighlightRow());
    //                 }
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // updateStatusStoreEmployeeRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.updateStatusStoreEmployeeRequest),
    //         map(action => action.payload),
    //         switchMap(({ body, id }) => {
    //             return this._$merchantApi.updatePatchStatusEmployee({ status: body }, id).pipe(
    //                 map(resp => {
    //                     this._$log.generateGroup(`[UPDATE STATUS RESPONSE STORE EMPLOYEE]`, {
    //                         response: {
    //                             type: 'log',
    //                             value: resp
    //                         }
    //                     });

    //                     return BrandStoreActions.updateStatusStoreEmployeeSuccess({
    //                         payload: resp
    //                     });
    //                 }),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.updateStatusStoreEmployeeFailure({
    //                             payload: { id: 'updateStatusStoreEmployeeFailure', errors: err }
    //                         })
    //                     )
    //                 ),
    //                 finalize(() => {
    //                     this.store.dispatch(UiActions.resetHighlightRow());
    //                 })
    //             );
    //         })
    //     )
    // );

    // updateStatusStoreEmployeeFailure$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.updateStatusStoreEmployeeFailure),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open('Update status gagal', 'error', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // updateStatusStoreEmployeeSuccess$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.updateStatusStoreEmployeeSuccess),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open('Update status berhasil', 'success', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Stores
     * @memberof MerchantEffects
     */
    fetchStoresRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.fetchStoresRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        StoreActions.fetchStoresFailure({
                            payload: { id: 'fetchStoresFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$merchantApi
                    .findAll<PaginateResponse<SupplierStore>>(payload, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            this._$log.generateGroup('[RESPONSE REQUEST FETCH STORES]', {
                                payload: {
                                    type: 'log',
                                    value: payload
                                },
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            let newResp = {
                                total: 0,
                                data: []
                            };

                            if (resp.total > 0) {
                                newResp = {
                                    total: resp.total,
                                    data: resp.data.map(row => {
                                        return new SupplierStore(
                                            row.id,
                                            row.supplierId,
                                            row.storeId,
                                            row.status,
                                            row.store,
                                            row.createdAt,
                                            row.updatedAt,
                                            row.deletedAt
                                        );
                                    })
                                };
                            }

                            return StoreActions.fetchStoresSuccess({
                                payload: { data: newResp.data, total: newResp.total }
                            });
                        }),
                        catchError(err =>
                            of(
                                StoreActions.fetchStoresFailure({
                                    payload: { id: 'fetchStoresFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Stores
     * @memberof MerchantEffects
     */
    fetchStoresFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.fetchStoresFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST FETCH STORES FAILURE',
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
     * [REQUEST] Store
     * @memberof MerchantEffects
     */
    fetchStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.fetchStoreRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$merchantApi.findById(id).pipe(
                    catchOffline(),
                    map(resp => {
                        this._$log.generateGroup('RESPONSE REQUEST FETCH STORE', {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        const newResp = new SupplierStore(
                            resp.id,
                            resp.supplierId,
                            resp.storeId,
                            resp.status,
                            resp.store,
                            resp.createdAt,
                            resp.updatedAt,
                            resp.deletedAt
                        );

                        return StoreActions.fetchStoreSuccess({
                            payload: newResp
                        });

                        // const change = SupplierStore.patch({ id: resp.id });

                        // return StoreActions.fetchStoreSuccess({
                        //     payload: {
                        //         id,
                        //         changes: change
                        //     }
                        // });
                    }),
                    catchError(err =>
                        of(
                            StoreActions.fetchStoreFailure({
                                payload: { id: 'fetchStoreFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Store
     * @memberof MerchantEffects
     */
    fetchStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.fetchStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$log.generateGroup(
                        'REQUEST FETCH STORE FAILURE',
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
     * [REQUEST - REQUEST] Store Edit
     * @memberof MerchantEffects
     */
    fetchStoreEditRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.fetchStoreEditRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([id, { supplierId }]) => {
                if (!id || !supplierId) {
                    return of(
                        StoreActions.fetchStoreEditFailure({
                            payload: {
                                id: 'fetchStoreEditFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                return this._$storeApi.findById(id, supplierId).pipe(
                    catchOffline(),
                    map(resp => {
                        return StoreActions.fetchStoreEditSuccess({
                            payload: new Merchant(resp)
                        });
                    }),
                    catchError(err =>
                        of(
                            StoreActions.fetchStoreEditFailure({
                                payload: {
                                    id: 'fetchStoreEditFailure',
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
     * [REQUEST - FAILURE] Store Edit
     * @memberof MerchantEffects
     */
    fetchStoreEditFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.fetchStoreEditFailure),
                map(action => action.payload),
                tap(resp => {
                    const message =
                        typeof resp.errors === 'string'
                            ? resp.errors
                            : resp.errors.error.message || resp.errors.message;

                    this.router.navigate(['/pages/account/stores']).finally(() => {
                        this._$notice.open(message, 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [REQUEST] Store Employees
     * @memberof MerchantEffects
     */
    fetchStoreEmployeesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.fetchStoreEmployeesRequest),
            map(action => action.payload),
            switchMap(({ params, storeId }) => {
                if (!params || !storeId) {
                    return of(
                        StoreActions.fetchStoreEmployeesFailure({
                            payload: { id: 'fetchStoreEmployeesFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$merchantEmployeeApi
                    .findAll<PaginateResponse<UserStore>>(params, storeId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                total: resp.total,
                                data:
                                    resp && resp.data && resp.data.length > 0
                                        ? resp.data.map(row => {
                                              const newUserStore = new UserStore(
                                                  row.id,
                                                  row.userId,
                                                  row.storeId,
                                                  row.status,
                                                  row.createdAt,
                                                  row.updatedAt,
                                                  row.deletedAt
                                              );

                                              if (row.user) {
                                                  newUserStore.setUser = row.user;
                                              }

                                              if (row.store) {
                                                  newUserStore.setStore = row.store;
                                              }

                                              return newUserStore;
                                          })
                                        : []
                            };

                            return StoreActions.fetchStoreEmployeesSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                StoreActions.fetchStoreEmployeesFailure({
                                    payload: { id: 'fetchStoreEmployeesFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Store Employees
     * @memberof MerchantEffects
     */
    fetchStoreEmployeesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.fetchStoreEmployeesFailure),
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

    /**
     *
     * [REQUEST] Store Employee Edit
     * @memberof MerchantEffects
     */
    fetchStoreEmployeeEditRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.fetchStoreEmployeeEditRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$userApi.findById(id).pipe(
                    catchOffline(),
                    map(resp => {
                        const newResp = new User(
                            resp.id,
                            resp.fullName,
                            resp.email,
                            resp.phoneNo,
                            resp.mobilePhoneNo,
                            resp.idNo,
                            resp.taxNo,
                            resp.status,
                            resp.imageUrl,
                            resp.taxImageUrl,
                            resp.idImageUrl,
                            resp.selfieImageUrl,
                            resp.urbanId,
                            resp.roles,
                            resp.createdAt,
                            resp.updatedAt,
                            resp.deletedAt
                        );

                        if (resp.userStores) {
                            newResp.setUserStores = resp.userStores;
                        }

                        if (resp.userSuppliers) {
                            newResp.setUserSuppliers = resp.userSuppliers;
                        }

                        if (resp.urban) {
                            newResp.setUrban = resp.urban;
                        }

                        if (resp.attendances) {
                            newResp.setAttendances = resp.attendances;
                        }

                        return StoreActions.fetchStoreEmployeeEditSuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            StoreActions.fetchStoreEmployeeEditFailure({
                                payload: { id: 'fetchStoreEmployeeEditFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Store Employee Edit
     * @memberof MerchantEffects
     */
    fetchStoreEmployeeEditFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.fetchStoreEmployeeEditFailure),
                map(action => action.payload),
                withLatestFrom(this.store.select(getParams)),
                tap(([resp, params]) => {
                    this.store.dispatch(StoreActions.goPage({ payload: 'employee' }));

                    const { storeId } = params;

                    this.router
                        .navigate(['/pages/account/stores', storeId, 'detail'])
                        .finally(() => {
                            const message =
                                typeof resp.errors === 'string'
                                    ? resp.errors
                                    : resp.errors.error.message || resp.errors.message;

                            this._$notice.open(message, 'error', {
                                verticalPosition: 'bottom',
                                horizontalPosition: 'right'
                            });
                        });
                })
            ),
        { dispatch: false }
    );

    // fetchBrandStoresRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.fetchBrandStoresRequest),
    //         map(action => action.payload),
    //         withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
    //         switchMap(([payload, auth]) => {
    //             if (!auth.user.data.userBrands.length) {
    //                 return of(
    //                     BrandStoreActions.fetchBrandStoresFailure({
    //                         payload: { id: 'fetchBrandStoresFailure', errors: 'Not Found!' }
    //                     })
    //                 );
    //             }

    //             return this._$merchantApi
    //                 .findAll(payload, auth.user.data.userBrands[0].brandId)
    //                 .pipe(
    //                     catchOffline(),
    //                     map(resp => {
    //                         let newResp = {
    //                             total: 0,
    //                             data: []
    //                         };

    //                         if (resp.total > 0) {
    //                             newResp = {
    //                                 total: resp.total,
    //                                 data: [
    //                                     ...resp.data.map(row => {
    //                                         return {
    //                                             ...new BrandStore(
    //                                                 row.id,
    //                                                 row.brandId,
    //                                                 row.storeId,
    //                                                 row.status,
    //                                                 row.store,
    //                                                 row.createdAt,
    //                                                 row.updatedAt,
    //                                                 row.deletedAt
    //                                             )
    //                                         };
    //                                     })
    //                                 ]
    //                             };
    //                         }

    //                         return BrandStoreActions.fetchBrandStoresSuccess({
    //                             payload: { brandStores: newResp.data, total: newResp.total }
    //                         });
    //                     }),
    //                     catchError(err =>
    //                         of(
    //                             BrandStoreActions.fetchBrandStoresFailure({
    //                                 payload: { id: 'fetchBrandStoresFailure', errors: err }
    //                             })
    //                         )
    //                     )
    //                 );
    //         })
    //     )
    // );

    // fetchBrandStoreEditRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.fetchBrandStoreEditRequest),
    //         map(action => action.payload),
    //         switchMap(id => {
    //             return this._$merchantApi.findStoreById(id).pipe(
    //                 catchOffline(),
    //                 map(resp =>
    //                     BrandStoreActions.fetchBrandStoreEditSuccess({
    //                         payload: {
    //                             brandStore: {
    //                                 ...new StoreEdit(
    //                                     resp.id,
    //                                     resp.storeCode,
    //                                     resp.name,
    //                                     resp.address,
    //                                     resp.taxNo,
    //                                     resp.longitude,
    //                                     resp.latitude,
    //                                     resp.largeArea,
    //                                     resp.phoneNo,
    //                                     resp.imageUrl,
    //                                     resp.taxImageUrl,
    //                                     resp.status,
    //                                     resp.reason,
    //                                     resp.parent,
    //                                     resp.parentId,
    //                                     resp.numberOfEmployee,
    //                                     resp.externalId,
    //                                     resp.storeTypeId,
    //                                     resp.storeGroupId,
    //                                     resp.storeSegmentId,
    //                                     resp.urbanId,
    //                                     resp.vehicleAccessibilityId,
    //                                     resp.warehouseId,
    //                                     resp.urban,
    //                                     resp.storeType,
    //                                     resp.storeSegment,
    //                                     resp.storeGroup,
    //                                     resp.storeClusters && resp.storeClusters.length > 0
    //                                         ? [
    //                                               ...resp.storeClusters.map(row => {
    //                                                   return {
    //                                                       ...new StoreCluster(
    //                                                           row.cluster.name,
    //                                                           row.cluster.createdAt,
    //                                                           row.cluster.updatedAt,
    //                                                           row.cluster.deletedAt,
    //                                                           row.cluster.id
    //                                                       )
    //                                                   };
    //                                               })
    //                                           ]
    //                                         : null,
    //                                     resp.createdAt,
    //                                     resp.updatedAt,
    //                                     resp.deletedAt
    //                                 )
    //                             },
    //                             source: 'fetch'
    //                         }
    //                     })
    //                 ),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.fetchBrandStoreEditFailure({
    //                             payload: {
    //                                 id: 'fetchBrandStoreEditFailure',
    //                                 errors: err
    //                             }
    //                         })
    //                     )
    //                 )
    //             );
    //         })
    //     )
    // );

    // fetchBrandStoreEditFailure$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.fetchBrandStoreEditFailure),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open(resp.errors.error.message, 'error', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // fetchBrandStoreRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.fetchBrandStoreRequest),
    //         map(action => action.payload),
    //         switchMap(id => {
    //             return this._$merchantApi.findById(id).pipe(
    //                 catchOffline(),
    //                 map(resp =>
    //                     BrandStoreActions.fetchBrandStoreSuccess({
    //                         payload: {
    //                             brandStore: {
    //                                 ...new BrandStore(
    //                                     resp.id,
    //                                     resp.brandId,
    //                                     resp.storeId,
    //                                     resp.status,
    //                                     resp.store,
    //                                     resp.createdAt,
    //                                     resp.updatedAt,
    //                                     resp.deletedAt
    //                                 )
    //                             },
    //                             source: 'fetch'
    //                         }
    //                     })
    //                 ),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.fetchBrandStoreFailure({
    //                             payload: {
    //                                 id: 'fetchBrandStoreFailure',
    //                                 errors: err
    //                             }
    //                         })
    //                     )
    //                 )
    //             );
    //         })
    //     )
    // );

    // fetchBrandStoreFailure$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.fetchBrandStoreFailure),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open(resp.errors.error.message, 'error', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // fetchStoreEmployeesRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.fetchStoreEmployeesRequest),
    //         map(action => action.payload),
    //         switchMap(payload => {
    //             if (!payload.storeId) {
    //                 return of(
    //                     BrandStoreActions.fetchStoreEmployeesFailure({
    //                         payload: { id: 'fetchStoreEmployeesFailure', errors: 'Not Found!' }
    //                     })
    //                 );
    //             }

    //             return this._$merchantApi
    //                 .findAllEmployeeByStoreId(payload.params, payload.storeId)
    //                 .pipe(
    //                     catchOffline(),
    //                     map(resp => {
    //                         let newResp = {
    //                             total: 0,
    //                             data: []
    //                         };

    //                         if (resp.total > 0) {
    //                             newResp = {
    //                                 total: resp.total,
    //                                 data: [
    //                                     ...resp.data.map(storeEmployee => {
    //                                         return {
    //                                             ...new StoreEmployee(
    //                                                 storeEmployee.id,
    //                                                 storeEmployee.userId,
    //                                                 storeEmployee.storeId,
    //                                                 storeEmployee.status,
    //                                                 storeEmployee.user,
    //                                                 storeEmployee.createdAt,
    //                                                 storeEmployee.updatedAt,
    //                                                 storeEmployee.deletedAt
    //                                             )
    //                                         };
    //                                     })
    //                                 ]
    //                             };
    //                         }

    //                         return BrandStoreActions.fetchStoreEmployeesSuccess({
    //                             payload: { employees: newResp.data, total: newResp.total }
    //                         });
    //                     }),
    //                     catchError(err =>
    //                         of(
    //                             BrandStoreActions.fetchStoreEmployeesFailure({
    //                                 payload: {
    //                                     id: 'fetchStoreEmployeesFailure',
    //                                     errors: err
    //                                 }
    //                             })
    //                         )
    //                     )
    //                 );
    //         })
    //     )
    // );

    // fetchStoreEmployeesFailure$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.fetchStoreEmployeesFailure),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open(resp.errors.error.message, 'error', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // fetchStoreEmployeeRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(BrandStoreActions.fetchStoreEmployeeRequest),
    //         map(action => action.payload),
    //         switchMap(id => {
    //             return this._$merchantApi.findStoreEmployeeById(id).pipe(
    //                 catchOffline(),
    //                 map(resp =>
    //                     BrandStoreActions.fetchStoreEmployeeSuccess({
    //                         payload: {
    //                             employee: {
    //                                 ...new StoreEmployeeDetail(
    //                                     resp.id,
    //                                     resp.fullName,
    //                                     resp.email,
    //                                     resp.phoneNo,
    //                                     resp.mobilePhoneNo,
    //                                     resp.idNo,
    //                                     resp.taxNo,
    //                                     resp.status,
    //                                     resp.imageUrl,
    //                                     resp.taxImageUrl,
    //                                     resp.idImageUrl,
    //                                     resp.selfieImageUrl,
    //                                     resp.roles,
    //                                     resp.createdAt,
    //                                     resp.updatedAt,
    //                                     resp.deletedAt
    //                                 )
    //                             },
    //                             source: 'fetch'
    //                         }
    //                     })
    //                 ),
    //                 catchError(err =>
    //                     of(
    //                         BrandStoreActions.fetchStoreEmployeeFailure({
    //                             payload: { id: 'fetchStoreEmployeeFailure', errors: err }
    //                         })
    //                     )
    //                 )
    //             );
    //         })
    //     )
    // );

    // fetchStoreEmployeeFailure$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(BrandStoreActions.fetchStoreEmployeeFailure),
    //             map(action => action.payload),
    //             tap(resp => {
    //                 this._$notice.open(resp.errors.error.message, 'error', {
    //                     verticalPosition: 'bottom',
    //                     horizontalPosition: 'right'
    //                 });
    //             })
    //         ),
    //     { dispatch: false }
    // );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromMerchant.FeatureState>,
        protected network: Network,
        private _$log: LogService,
        private _$merchantApi: MerchantApiService,
        private _$merchantEmployeeApi: MerchantEmployeeApiService,
        private _$notice: NoticeService,
        private _$storeApi: StoreApiService,
        private _$userApi: UserApiService
    ) {}
}
