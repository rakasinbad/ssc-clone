import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, LogService, NoticeService, UserApiService } from 'app/shared/helpers';
import { ChangeConfirmationComponent, DeleteConfirmationComponent } from 'app/shared/modals';
import { PaginateResponse, TStatus } from 'app/shared/models/global.model';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { User } from 'app/shared/models/user.model';
import { UiActions } from 'app/shared/store/actions';
import { InternalEmployeeDetails } from 'app/main/pages/accounts/internal/models';
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

import { InternalApiService } from '../../services';
import { InternalActions } from '../actions';
import { fromInternal } from '../reducers';

@Injectable()
export class InternalEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [CREATE - REQUEST] Internal Employee
     * @memberof InternalEffects
     */
    createInternalEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.createInternalEmployeeRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$internalApi
                    .create<{
                        fullName: string;
                        roles: number[];
                        mobilePhoneNo: string;
                        email?: string;
                        supplierId: string;
                    }>(payload)
                    .pipe(
                        map(resp => {
                            return InternalActions.createInternalEmployeeSuccess({ payload: resp });
                        }),
                        catchError(err =>
                            of(
                                InternalActions.createInternalEmployeeFailure({
                                    payload: { id: 'createInternalEmployeeFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    /**
     *
     * [CREATE - FAILURE] Internal Employee
     * @memberof InternalEffects
     */
    createInternalEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.createInternalEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
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
     * [CREATE - SUCCESS] Internal Employee
     * @memberof InternalEffects
     */
    createInternalEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.createInternalEmployeeSuccess),
                map(action => action.payload),
                tap(resp => {
                    this.router.navigate(['/pages/account/internal']).finally(() => {
                        this._$notice.open('Data berhasil ditambah', 'success', {
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
     * [UPDATE - REQUEST] Internal Employee
     * @memberof InternalEffects
     */
    updateInternalEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.updateInternalEmployeeRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$userApi
                    .patchCustom<{
                        fullName?: string;
                        roles?: number[];
                        mobilePhoneNo?: string;
                        email?: string;
                    }>(body, id)
                    .pipe(
                        map(resp => {
                            return InternalActions.updateInternalEmployeeSuccess({
                                payload: resp
                            });
                        }),
                        catchError(err =>
                            of(
                                InternalActions.updateInternalEmployeeFailure({
                                    payload: {
                                        id: 'updateInternalEmployeeFailure',
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
     * [UPDATE - FAILURE] Internal Employee
     * @memberof InternalEffects
     */
    updateInternalEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.updateInternalEmployeeFailure),
                map(action => action.payload),
                tap(resp => {
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
     * [UPDATE - SUCCESS] Internal Employee
     * @memberof InternalEffects
     */
    updateInternalEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.updateInternalEmployeeSuccess),
                map(action => action.payload),
                tap(resp => {
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

    /**
     *
     * [DELETE - DIALOG] Internal Employee
     * @memberof InternalEffects
     */
    confirmDeleteInternalEmployee$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.confirmDeleteInternalEmployee),
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
                if (id) {
                    return InternalActions.deleteInternalEmployeeRequest({ payload: id });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    /**
     *
     * [DELETE - REQUEST] Internal Employee
     * @memberof InternalEffects
     */
    deleteInternalEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.deleteInternalEmployeeRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$internalApi.delete(id).pipe(
                    map(resp => {
                        return InternalActions.deleteInternalEmployeeSuccess({ payload: id });
                    }),
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

    /**
     *
     * [DELETE - FAILURE] Internal Employee
     * @memberof InternalEffects
     */
    deleteInternalEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.deleteInternalEmployeeFailure),
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

    /**
     *
     * [DELETE - SUCCESS] Internal Employee
     * @memberof InternalEffects
     */
    deleteInternalEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.deleteInternalEmployeeSuccess),
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

    /**
     *
     * [UPDATE - DIALOG] Status Internal Employee
     * @memberof InternalEffects
     */
    confirmChangeStatusInternalEmployee$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.confirmChangeStatusInternalEmployee),
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
                    return InternalActions.updateStatusInternalEmployeeRequest({
                        payload: { body: change, id: id }
                    });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    /**
     *
     * [UPDATE - REQUEST] Status Internal Employee
     * @memberof InternalEffects
     */
    updateStatusInternalEmployeeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.updateStatusInternalEmployeeRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                const change = UserSupplier.patch({ status: body });

                return this._$internalApi.patch(change, id).pipe(
                    map(resp => {
                        return InternalActions.updateStatusInternalEmployeeSuccess({
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

    /**
     *
     * [UPDATE - FAILURE] Status Internal Employee
     * @memberof InternalEffects
     */
    updateStatusInternalEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.updateStatusInternalEmployeeFailure),
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

    /**
     *
     * [UPDATE - SUCCESS] Status Internal Employee
     * @memberof InternalEffects
     */
    updateStatusInternalEmployeeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.updateStatusInternalEmployeeSuccess),
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

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Internal Employees
     * @memberof InternalEffects
     */
    fetchInternalEmployeesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.fetchInternalEmployeesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([params, { supplierId }]) => {
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

                return this._$internalApi
                    .findAll<PaginateResponse<UserSupplier>>(params, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                total: resp.total,
                                data:
                                    resp && resp.data && resp.data.length > 0
                                        ? resp.data.map(row => {
                                              const newUserSupplier = new UserSupplier(
                                                  row.id,
                                                  row.userId,
                                                  row.supplierId,
                                                  row.status,
                                                  row.supplier,
                                                  row.createdAt,
                                                  row.updatedAt,
                                                  row.deletedAt
                                              );

                                              if (row.user) {
                                                  newUserSupplier.setUser = row.user;
                                              }

                                              return newUserSupplier;
                                          })
                                        : []
                            };

                            return InternalActions.fetchInternalEmployeesSuccess({
                                payload: newResp
                            });

                            // let newResp = {
                            //     total: 0,
                            //     data: []
                            // };

                            // if (resp.total > 0) {
                            //     newResp = {
                            //         total: resp.total,
                            //         data: [
                            //             ...resp.data.map(row => {
                            //                 return {
                            //                     ...new InternalEmployee(
                            //                         row.id,
                            //                         row.userId,
                            //                         row.brandId,
                            //                         row.status,
                            //                         row.user,
                            //                         row.createdAt,
                            //                         row.updatedAt,
                            //                         row.deletedAt
                            //                     )
                            //                 };
                            //             })
                            //         ]
                            //     };
                            // }

                            // return InternalActions.fetchInternalEmployeesSuccess({
                            //     payload: { internalEmployees: newResp.data, total: newResp.total }
                            // });
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

    /**
     *
     * [REQUEST - FAILURE] Internal Employees
     * @memberof InternalEffects
     */
    fetchInternalEmployeesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.fetchInternalEmployeesFailure),
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
     * [REQUEST] Internal Employee
     * @memberof InternalEffects
     */
    // fetchInternalEmployeeRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(InternalActions.fetchInternalEmployeeRequest),
    //         map(action => action.payload),
    //         switchMap(id => {
    //             return this._$userApi.findById(id).pipe(
    //                 catchOffline(),
    //                 map(resp => {
    //                     return InternalActions.fetchInternalEmployeeSuccess({
    //                         payload: new User(resp)
    //                     });
    //                 }),
    //                 catchError(err =>
    //                     of(
    //                         InternalActions.fetchInternalEmployeeFailure({
    //                             payload: { id: 'fetchInternalEmployeeFailure', errors: err }
    //                         })
    //                     )
    //                 )
    //             );
    //         })
    //     )
    // );

        fetchInternalEmployeeRequest$ = createEffect(() =>
            this.actions$.pipe(
                ofType(InternalActions.fetchInternalEmployeeRequest),
                map(action => action.payload),
                switchMap(id => {
                    return this._$internalApi.findById(id).pipe(
                        catchOffline(),
                        map(resp => {
                            return InternalActions.fetchInternalEmployeeSuccess({
                                payload: new InternalEmployeeDetails(resp)
                            });
                        }),
                        catchError(err =>
                            of(
                                InternalActions.fetchInternalEmployeeFailure({
                                    payload: { id: 'fetchInternalEmployeeFailure', errors: err }
                                })
                            )
                        )
                    );
                })
            )
        );

    /**
     *
     * [REQUEST - FAILURE] Internal Employee
     * @memberof InternalEffects
     */
    fetchInternalEmployeeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(InternalActions.fetchInternalEmployeeFailure),
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

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromInternal.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$internalApi: InternalApiService,
        private _$userApi: UserApiService
    ) {}
}
