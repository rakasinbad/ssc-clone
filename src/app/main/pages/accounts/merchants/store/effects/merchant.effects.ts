import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { StoreCluster } from 'app/shared/models';
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

import { BrandStore, StoreEdit, StoreEmployee, StoreEmployeeDetail } from '../../models';
import { MerchantApiService } from '../../services';
import { BrandStoreActions } from '../actions';
import { fromMerchant } from '../reducers';

@Injectable()
export class MerchantEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    createStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.createStoreRequest),
            map(action => action.payload),
            switchMap(payload =>
                this._$merchantApi.createStore(payload).pipe(
                    map(resp => BrandStoreActions.createStoreSuccess({ payload: resp })),
                    catchError(err =>
                        of(
                            BrandStoreActions.createStoreFailure({
                                payload: { id: 'createStoreFailure', errors: err }
                            })
                        )
                    ),
                    finalize(() => {
                        this.store.dispatch(FormActions.resetClickSaveButton());
                    })
                )
            )
        )
    );

    createStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.createStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    console.log('GAGAL CREATE STORE', resp);
                    this._$notice.open('Data gagal dibuat', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    createStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.createStoreSuccess),
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

    updateStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.updateStoreRequest),
            map(action => action.payload),
            switchMap(({ body, id }) =>
                this._$merchantApi.updatePatchStore(body, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[UPDATE RESPONSE STORE]`, {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return BrandStoreActions.updateStoreSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            BrandStoreActions.updateStoreFailure({
                                payload: { id: 'updateStoreFailure', errors: err }
                            })
                        )
                    )
                )
            )
        )
    );

    updateStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.updateStoreSuccess),
                map(action => action.payload),
                tap(resp => {
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

    confirmDeleteStore$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.confirmDeleteStore),
                map(action => action.payload),
                exhaustMap(params => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Delete',
                            message: `Are you sure want to delete <strong>${params.store.name}</strong> ?`,
                            id: params.id
                        },
                        disableClose: true
                    });

                    return dialogRef.afterClosed();
                }),
                map(resp => {
                    if (resp) {
                        this.store.dispatch(
                            BrandStoreActions.deleteStoreRequest({ payload: resp })
                        );
                    } else {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    deleteStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.deleteStoreRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$merchantApi.deleteStore(id).pipe(
                    map(resp => BrandStoreActions.deleteStoreSuccess({ payload: resp.id })),
                    catchError(err =>
                        of(
                            BrandStoreActions.deleteStoreFailure({
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

    deleteStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.deleteStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Data gagal dihapus', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    deleteStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.deleteStoreSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Data berhasil dihapus', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    confirmChangeStatusStore$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.confirmChangeStatusStore),
                map(action => action.payload),
                exhaustMap(params => {
                    const title = params.status === 'active' ? 'Inactive' : 'Active';
                    const body = params.status === 'active' ? 'inactive' : 'active';
                    const dialogRef = this.matDialog.open(ChangeConfirmationComponent, {
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
                        this.store.dispatch(
                            BrandStoreActions.updateStatusStoreRequest({
                                payload: { body: change, id: id }
                            })
                        );
                    } else {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    updateStatusStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.updateStatusStoreRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$merchantApi.updatePatchStatusStore({ status: body }, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[UPDATE STATUS RESPONSE STORE]`, {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return BrandStoreActions.updateStatusStoreSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            BrandStoreActions.updateStatusStoreFailure({
                                payload: { id: 'updateStatusStoreFailure', errors: err }
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

    updateStatusStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.updateStatusStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Update status gagal', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    updateStatusStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.updateStatusStoreSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Update status berhasil', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    updateStoreEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.updateStoreEmployeeRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$merchantApi.updatePatchEmployee(body, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[UPDATE RESPONSE EMPLOYEE]`, {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        this.store.dispatch(BrandStoreActions.goPage({ payload: 'employee' }));

                        return BrandStoreActions.updateStoreEmployeeSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            BrandStoreActions.updateStoreEmployeeFailure({
                                payload: { id: 'updateStoreEmployeeFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    updateStoreEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.updateStoreEmployeeSuccess),
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

    confirmDeleteStoreEmployee$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.confirmDeleteStoreEmployee),
                map(action => action.payload),
                exhaustMap(params => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Delete',
                            message: `Are you sure want to delete <strong>${params.user.fullName}</strong> ?`,
                            id: params.id
                        },
                        disableClose: true
                    });

                    return dialogRef.afterClosed();
                }),
                map(resp => {
                    console.log('CONFIRM DELETE', resp);

                    if (resp) {
                        this.store.dispatch(
                            BrandStoreActions.deleteStoreEmployeeRequest({ payload: resp })
                        );
                    } else {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    deleteStoreEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.deleteStoreEmployeeRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$merchantApi.deleteEmployee(id).pipe(
                    map(resp => {
                        console.log('RESP', resp);

                        return BrandStoreActions.deleteStoreEmployeeSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            BrandStoreActions.deleteStoreEmployeeFailure({
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

    deleteStoreEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.deleteStoreEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
                    console.log('DELETE STORE EMPLOYEE ERR', resp);

                    this._$notice.open('Data gagal dihapus', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    deleteStoreEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.deleteStoreEmployeeSuccess),
                map(action => action.payload),
                tap(resp => {
                    console.log('DELETE STORE EMPLOYEE', resp);

                    this._$notice.open('Data berhasil dihapus', 'success', {
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

    fetchBrandStoresRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.fetchBrandStoresRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            switchMap(([payload, auth]) => {
                if (!auth.user.data.userBrands.length) {
                    return of(
                        BrandStoreActions.fetchBrandStoresFailure({
                            payload: { id: 'fetchBrandStoresFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$merchantApi
                    .findAll(payload, auth.user.data.userBrands[0].brandId)
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
                                    data: [
                                        ...resp.data.map(row => {
                                            return {
                                                ...new BrandStore(
                                                    row.id,
                                                    row.brandId,
                                                    row.storeId,
                                                    row.status,
                                                    row.store,
                                                    row.createdAt,
                                                    row.updatedAt,
                                                    row.deletedAt
                                                )
                                            };
                                        })
                                    ]
                                };
                            }

                            return BrandStoreActions.fetchBrandStoresSuccess({
                                payload: { brandStores: newResp.data, total: newResp.total }
                            });
                        }),
                        catchError(err =>
                            of(
                                BrandStoreActions.fetchBrandStoresFailure({
                                    payload: { id: 'fetchBrandStoresFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchBrandStoreEditRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.fetchBrandStoreEditRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$merchantApi.findStoreById(id).pipe(
                    catchOffline(),
                    map(resp =>
                        BrandStoreActions.fetchBrandStoreEditSuccess({
                            payload: {
                                brandStore: {
                                    ...new StoreEdit(
                                        resp.id,
                                        resp.storeCode,
                                        resp.name,
                                        resp.address,
                                        resp.taxNo,
                                        resp.longitude,
                                        resp.latitude,
                                        resp.largeArea,
                                        resp.phoneNo,
                                        resp.imageUrl,
                                        resp.taxImageUrl,
                                        resp.status,
                                        resp.reason,
                                        resp.parent,
                                        resp.parentId,
                                        resp.numberOfEmployee,
                                        resp.externalId,
                                        resp.storeTypeId,
                                        resp.storeGroupId,
                                        resp.storeSegmentId,
                                        resp.urbanId,
                                        resp.vehicleAccessibilityId,
                                        resp.warehouseId,
                                        resp.urban,
                                        resp.storeType,
                                        resp.storeSegment,
                                        resp.storeGroup,
                                        resp.storeClusters && resp.storeClusters.length > 0
                                            ? [
                                                  ...resp.storeClusters.map(row => {
                                                      return {
                                                          ...new StoreCluster(
                                                              row.cluster.name,
                                                              row.cluster.createdAt,
                                                              row.cluster.updatedAt,
                                                              row.cluster.deletedAt,
                                                              row.cluster.id
                                                          )
                                                      };
                                                  })
                                              ]
                                            : null,
                                        resp.createdAt,
                                        resp.updatedAt,
                                        resp.deletedAt
                                    )
                                },
                                source: 'fetch'
                            }
                        })
                    ),
                    catchError(err =>
                        of(
                            BrandStoreActions.fetchBrandStoreEditFailure({
                                payload: {
                                    id: 'fetchBrandStoreEditFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchBrandStoreEditFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.fetchBrandStoreEditFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open(resp.errors.error.message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    fetchBrandStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.fetchBrandStoreRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$merchantApi.findById(id).pipe(
                    catchOffline(),
                    map(resp =>
                        BrandStoreActions.fetchBrandStoreSuccess({
                            payload: {
                                brandStore: {
                                    ...new BrandStore(
                                        resp.id,
                                        resp.brandId,
                                        resp.storeId,
                                        resp.status,
                                        resp.store,
                                        resp.createdAt,
                                        resp.updatedAt,
                                        resp.deletedAt
                                    )
                                },
                                source: 'fetch'
                            }
                        })
                    ),
                    catchError(err =>
                        of(
                            BrandStoreActions.fetchBrandStoreFailure({
                                payload: {
                                    id: 'fetchBrandStoreFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchBrandStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.fetchBrandStoreFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open(resp.errors.error.message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    fetchStoreEmployeesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.fetchStoreEmployeesRequest),
            map(action => action.payload),
            switchMap(payload => {
                if (!payload.storeId) {
                    return of(
                        BrandStoreActions.fetchStoreEmployeesFailure({
                            payload: { id: 'fetchStoreEmployeesFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$merchantApi
                    .findAllEmployeeByStoreId(payload.params, payload.storeId)
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
                                    data: [
                                        ...resp.data.map(storeEmployee => {
                                            return {
                                                ...new StoreEmployee(
                                                    storeEmployee.id,
                                                    storeEmployee.userId,
                                                    storeEmployee.storeId,
                                                    storeEmployee.status,
                                                    storeEmployee.user,
                                                    storeEmployee.createdAt,
                                                    storeEmployee.updatedAt,
                                                    storeEmployee.deletedAt
                                                )
                                            };
                                        })
                                    ]
                                };
                            }

                            return BrandStoreActions.fetchStoreEmployeesSuccess({
                                payload: { employees: newResp.data, total: newResp.total }
                            });
                        }),
                        catchError(err =>
                            of(
                                BrandStoreActions.fetchStoreEmployeesFailure({
                                    payload: {
                                        id: 'fetchStoreEmployeesFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchStoreEmployeesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.fetchStoreEmployeesFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open(resp.errors.error.message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    fetchStoreEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandStoreActions.fetchStoreEmployeeRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$merchantApi.findStoreEmployeeById(id).pipe(
                    catchOffline(),
                    map(resp =>
                        BrandStoreActions.fetchStoreEmployeeSuccess({
                            payload: {
                                employee: {
                                    ...new StoreEmployeeDetail(
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
                                        resp.roles,
                                        resp.createdAt,
                                        resp.updatedAt,
                                        resp.deletedAt
                                    )
                                },
                                source: 'fetch'
                            }
                        })
                    ),
                    catchError(err =>
                        of(
                            BrandStoreActions.fetchStoreEmployeeFailure({
                                payload: { id: 'fetchStoreEmployeeFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchStoreEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(BrandStoreActions.fetchStoreEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
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
        private store: Store<fromMerchant.FeatureState>,
        protected network: Network,
        private _$log: LogService,
        private _$merchantApi: MerchantApiService,
        private _$notice: NoticeService
    ) {}
}
