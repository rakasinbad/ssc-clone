import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { UiActions } from 'app/shared/store/actions';
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

import { BrandStore, StoreEmployee, StoreEmployeeDetail } from '../../models';
import { MerchantApiService } from '../../services';
import { BrandStoreActions } from '../actions';
import { fromMerchant } from '../reducers';

@Injectable()
export class MerchantEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

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
                    console.log('GAGAL');
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
                    console.log('SUKSES');
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
