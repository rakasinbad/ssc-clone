import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { StoreCluster } from 'app/shared/models';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { getParams } from 'app/store/app.reducer';
import { of } from 'rxjs';
import { catchError, exhaustMap, finalize, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Store } from '../../models';
import { StoreApiService } from '../../services';
import { StoreActions } from '../actions';
import { fromStore } from '../reducers';

@Injectable()
export class StoreEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    createStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.createStoreRequest),
            map(action => action.payload),
            switchMap(payload =>
                this._$storeApi.createStore(payload).pipe(
                    map(resp => StoreActions.createStoreSuccess({ payload: resp })),
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
                )
            )
        )
    );

    createStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.createStoreFailure),
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
                ofType(StoreActions.createStoreSuccess),
                map(action => action.payload),
                tap(resp => {
                    this.router.navigate(['/pages/attendances']).finally(() => {
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
            ofType(StoreActions.updateStoreRequest),
            map(action => action.payload),
            switchMap(({ store, id }) =>
                this._$storeApi.patchStore(store, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[UPDATE RESPONSE STORE]`, {
                            response: {
                                type: 'log',
                                value: resp
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
                )
            )
        )
    );

    updateStoreSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.updateStoreSuccess),
                map(action => action.payload),
                tap(resp => {
                    this.router.navigate(['/pages/attendances']).finally(() => {
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
                ofType(StoreActions.confirmDeleteStore),
                map(action => action.payload),
                exhaustMap(params => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Delete',
                            message: `Are you sure want to delete <strong>${params.name}</strong> ?`,
                            id: params.id
                        },
                        disableClose: true
                    });

                    return dialogRef.afterClosed();
                }),
                map(resp => {
                    if (resp) {
                        this.store.dispatch(
                            StoreActions.deleteStoreRequest({ payload: resp })
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
            ofType(StoreActions.deleteStoreRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$storeApi.deleteStore(id).pipe(
                    map(resp => StoreActions.deleteStoreSuccess({ payload: resp.id })),
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

    deleteStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.deleteStoreFailure),
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
                ofType(StoreActions.deleteStoreSuccess),
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

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    fetchStoresRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.fetchStoresRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            switchMap(([payload, auth]) => {
                if (!auth.user.data.userSuppliers.length) {
                    return of(
                        StoreActions.fetchStoresFailure({
                            payload: { id: 'fetchStoresFailure', errors: 'Not Found!' }
                        })
                    );
                }

                return this._$storeApi
                    .findAllStore(payload, auth.user.data.userSuppliers[0].supplierId)
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
                                                ...new Store(
                                                    row.id,
                                                    row.storeCode,
                                                    row.name,
                                                    row.address,
                                                    row.taxNo,
                                                    row.longitude,
                                                    row.latitude,
                                                    row.largeArea,
                                                    row.phoneNo,
                                                    row.imageUrl,
                                                    row.taxImageUrl,
                                                    row.status,
                                                    row.reason,
                                                    row.parent,
                                                    row.parentId,
                                                    row.numberOfEmployee,
                                                    row.externalId,
                                                    row.storeTypeId,
                                                    row.storeGroupId,
                                                    row.storeSegmentId,
                                                    row.urbanId,
                                                    row.warehouseId,
                                                    row.vehicleAccessibility,
                                                    row.urban,
                                                    row.customerHierarchies,
                                                    row.storeType,
                                                    row.storeSegment,
                                                    row.storeGroup,
                                                    row.legalInfo,
                                                    row.createdAt,
                                                    row.updatedAt,
                                                    row.deletedAt
                                                )
                                            };
                                        })
                                    ]
                                };
                            }

                            return StoreActions.fetchStoresSuccess({
                                payload: { stores: newResp.data, total: newResp.total }
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

    fetchStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreActions.fetchStoreRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$storeApi.findStoreById(id.storeId).pipe(
                    catchOffline(),
                    map(resp =>
                        StoreActions.fetchStoreSuccess({
                            payload: {
                                store: {
                                    ...new Store(
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
                                        resp.warehouseId,
                                        resp.vehicleAccessibility,
                                        resp.urban,
                                        resp.customerHierarchies,
                                        resp.storeType,
                                        resp.storeSegment,
                                        resp.storeGroup,
                                        resp.legalInfo,
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
                            StoreActions.fetchStoreFailure({
                                payload: {
                                    id: 'fetchStoreFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreActions.fetchStoreFailure),
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
        private store: NgRxStore<fromStore.FeatureState>,
        protected network: Network,
        private _$log: LogService,
        private _$storeApi: StoreApiService,
        private _$notice: NoticeService
    ) {}
}
