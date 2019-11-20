import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
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

import { InternalEmployee, InternalEmployeeDetail } from '../../models';
import { InternalApiService } from '../../services';
import { InternalActions } from '../actions';
import { fromInternal } from '../reducers';

@Injectable()
export class InternalEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    updateInternalEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.updateInternalEmployeeRequest),
            map(action => action.payload),
            switchMap(({ body, id }) =>
                this._$internalApi.updatePatch(body, id).pipe(
                    map(resp => {
                        this._$log.generateGroup(`[UPDATE RESPONSE INTERNAL]`, {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return InternalActions.updateInternalEmployeeSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            InternalActions.updateInternalEmployeeFailure({
                                payload: { id: 'updateInternalEmployeeFailure', errors: err }
                            })
                        )
                    )
                )
            )
        )
    );

    updateInternalEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.updateInternalEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
                    console.log('UPDATE EMPLOYEE ERR', resp);

                    this._$notice.open('Data gagal diupdate', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    updateInternalEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.updateInternalEmployeeSuccess),
                map(action => action.payload),
                tap(resp => {
                    console.log('UPDATE EMPLOYEE', resp);

                    this.router.navigate(['/pages/account/internal']).finally(() => {
                        this._$notice.open('Data berhasil diupdate', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    confirmDeleteInternalEmployee$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.confirmDeleteInternalEmployee),
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
                    if (resp) {
                        this.store.dispatch(
                            InternalActions.deleteInternalEmployeeRequest({ payload: resp })
                        );
                    } else {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    deleteInternalEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.deleteInternalEmployeeRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$internalApi.delete(id).pipe(
                    map(resp => InternalActions.deleteInternalEmployeeSuccess({ payload: resp })),
                    catchError(err =>
                        of(
                            InternalActions.deleteInternalEmployeeFailure({
                                payload: { id: 'deleteInternalEmployeeFailure', errors: err }
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

    deleteInternalEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.deleteInternalEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
                    console.log('DELETE INTERNAL EMPLOYEE ERR', resp);

                    this._$notice.open('Data gagal dihapus', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    deleteInternalEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.deleteInternalEmployeeSuccess),
                map(action => action.payload),
                tap(resp => {
                    console.log('DELETE INTERNAL EMPLOYEE', resp);

                    this._$notice.open('Data berhasil dihapus', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    confirmChangeStatusInternalEmployee$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.confirmChangeStatusInternalEmployee),
                map(action => action.payload),
                exhaustMap(params => {
                    const title = params.status === 'active' ? 'Inactive' : 'Active';
                    const body = params.status === 'active' ? 'inactive' : 'active';
                    const dialogRef = this.matDialog.open(ChangeConfirmationComponent, {
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
                        this.store.dispatch(
                            InternalActions.updateStatusInternalEmployeeRequest({
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

    updateStatusInternalEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.updateStatusInternalEmployeeRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$internalApi
                    .updatePatchStatusInternalEmployee({ status: body }, id)
                    .pipe(
                        map(resp => {
                            this._$log.generateGroup(`[UPDATE STATUS RESPONSE INTERNAL EMPLOYEE]`, {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            return InternalActions.updateStatusInternalEmployeeSuccess();
                        }),
                        catchError(err =>
                            of(
                                InternalActions.updateStatusInternalEmployeeFailure({
                                    payload: {
                                        id: 'updateStatusInternalEmployeeFailure',
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

    updateStatusInternalEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.updateStatusInternalEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
                    console.log('UPDATE STATUS INTERNAL EMPLOYEE ERR', resp);

                    this._$notice.open('Update status gagal', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    updateStatusInternalEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.updateStatusInternalEmployeeSuccess),
                tap(() => {
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

    fetchInternalEmployeesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.fetchInternalEmployeesRequest),
            map(action => action.payload),
            // withLatestFrom(this.store.select(AuthSelectors.getAuthState))
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            // switchMap(([payload, auth]) => {
            switchMap(([payload, { supplierId }]) => {
                if (!supplierId) {
                    return of(
                        InternalActions.fetchInternalEmployeesFailure({
                            payload: {
                                id: 'fetchInternalEmployeesFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                return this._$internalApi.findAll(payload, supplierId).pipe(
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
                                            ...new InternalEmployee(
                                                row.id,
                                                row.userId,
                                                row.brandId,
                                                row.status,
                                                row.user,
                                                row.createdAt,
                                                row.updatedAt,
                                                row.deletedAt
                                            )
                                        };
                                    })
                                ]
                            };
                        }

                        return InternalActions.fetchInternalEmployeesSuccess({
                            payload: { internalEmployees: newResp.data, total: newResp.total }
                        });
                    }),
                    catchError(err =>
                        of(
                            InternalActions.fetchInternalEmployeesFailure({
                                payload: { id: 'fetchInternalEmployeesFailure', errors: err }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchInternalEmployeesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.fetchInternalEmployeesFailure),
                map(action => action.payload),
                tap(resp => {
                    console.log('FETCH EMPLOYEES ERR', resp);

                    this._$notice.open(resp.errors.error.message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    fetchInternalEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.fetchInternalEmployeeRequest),
            map(action => action.payload),
            switchMap(id =>
                this._$internalApi.findById(id).pipe(
                    catchOffline(),
                    map(resp =>
                        InternalActions.fetchInternalEmployeeSuccess({
                            payload: {
                                internalEmployee: new InternalEmployeeDetail(
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
                                ),
                                source: 'fetch'
                            }
                        })
                    ),
                    catchError(err =>
                        of(
                            InternalActions.fetchInternalEmployeeFailure({
                                payload: { id: 'fetchInternalEmployeeFailure', errors: err }
                            })
                        )
                    )
                )
            )
        )
    );

    fetchInternalEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.fetchInternalEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
                    console.log('FETCH EMPLOYEE ERR', resp);

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
        private store: Store<fromInternal.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$internalApi: InternalApiService
    ) {}
}
