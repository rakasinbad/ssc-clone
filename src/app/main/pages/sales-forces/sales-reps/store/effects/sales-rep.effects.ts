import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { ErrorHandler, EStatus, IQueryParams, PaginateResponse } from 'app/shared/models';
import { FormActions, UiActions } from 'app/shared/store/actions';
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

import { SalesRep, SalesRepForm, SalesRepFormPatch } from '../../models';
import { SalesRepApiService } from '../../services';
import { SalesRepActions } from '../actions';
import * as fromSalesReps from '../reducers';

@Injectable()
export class SalesRepEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - SALES REP]
    // -----------------------------------------------------------------------------------------------------

    createSalesRepRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.createSalesRepRequest),
            map(action => action.payload),
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
            switchMap(([payload, data]: [Required<SalesRepForm>, string | Auth]) => {
                if (!data) {
                    return of(
                        SalesRepActions.createSalesRepFailure({
                            payload: new ErrorHandler({
                                id: 'createSalesRepFailure',
                                errors: 'Not Found!'
                            })
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
                        SalesRepActions.createSalesRepFailure({
                            payload: new ErrorHandler({
                                id: 'createSalesRepFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                payload = {
                    ...payload,
                    supplierId
                };

                return this._$salesRepApi.create<Required<SalesRepForm>>(payload).pipe(
                    map(resp => {
                        return SalesRepActions.createSalesRepSuccess({
                            payload: new SalesRep(resp)
                        });
                    }),
                    catchError(err =>
                        of(
                            SalesRepActions.createSalesRepFailure({
                                payload: new ErrorHandler({
                                    id: 'createSalesRepFailure',
                                    errors: err
                                })
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

    createSalesRepFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.createSalesRepFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = this._handleErrMessage(resp) || 'Failed to create sales rep';

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    createSalesRepSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.createSalesRepSuccess),
                map(action => action.payload),
                tap(resp => {
                    this.router.navigate(['/pages/sales-force/sales-rep']).finally(() => {
                        this._$notice.open('Successfully created sales rep', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [UPDATE - SALES REP]
    // -----------------------------------------------------------------------------------------------------

    updateSalesRepRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.updateSalesRepRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$salesRepApi.patch(body, id).pipe(
                    map(resp => {
                        return SalesRepActions.updateSalesRepSuccess({
                            payload: new SalesRep(resp)
                        });
                    }),
                    catchError(err =>
                        of(
                            SalesRepActions.updateSalesRepFailure({
                                payload: { id: 'updateSalesRepFailure', errors: err }
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

    updateSalesRepFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.updateSalesRepFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = this._handleErrMessage(resp) || 'Failed to update sales rep';

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    updateSalesRepSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.updateSalesRepSuccess),
                map(action => action.payload),
                tap(resp => {
                    this.router.navigate(['/pages/sales-force/sales-rep']).finally(() => {
                        this._$notice.open('Successfully updated sales rep', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CHANGE STATUS - SALES REP]
    // -----------------------------------------------------------------------------------------------------

    confirmChangeStatusSalesRep$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.confirmChangeStatusSalesRep),
            map(action => action.payload),
            exhaustMap(params => {
                const title = params.status === EStatus.ACTIVE ? 'Inactive' : 'Active';
                const body = params.status === EStatus.ACTIVE ? EStatus.INACTIVE : EStatus.ACTIVE;
                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: EStatus }
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
                    return SalesRepActions.changeStatusSalesRepRequest({
                        payload: { id, body: change }
                    });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    changeStatusSalesRepRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.changeStatusSalesRepRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                const change: SalesRepFormPatch = {
                    status: body
                };

                return this._$salesRepApi.patch(change, id).pipe(
                    map(resp => {
                        return SalesRepActions.changeStatusSalesRepSuccess({
                            payload: {
                                id,
                                changes: {
                                    ...resp,
                                    status: body,
                                    updatedAt: resp.updatedAt
                                }
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            SalesRepActions.changeStatusSalesRepFailure({
                                payload: { id: 'changeStatusSalesRepFailure', errors: err }
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

    changeStatusSalesRepFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.changeStatusSalesRepFailure),
                map(action => action.payload),
                tap(resp => {
                    const message =
                        this._handleErrMessage(resp) || 'Failed to change status sales rep';

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    changeStatusSalesRepSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.changeStatusSalesRepSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Successfully changed status sales rep', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CHANGE PASSWORD - SALES REP]
    // -----------------------------------------------------------------------------------------------------

    changePasswordSalesRepRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.changePasswordSalesRepRequest),
            map(action => action.payload),
            switchMap(({ body, id }) => {
                return this._$salesRepApi.put(body, id).pipe(
                    map(resp => {
                        return SalesRepActions.updateSalesRepSuccess({
                            payload: new SalesRep(resp)
                        });
                    }),
                    catchError(err =>
                        of(
                            SalesRepActions.updateSalesRepFailure({
                                payload: { id: 'updateSalesRepFailure', errors: err }
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

    changePasswordSalesRepFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.changePasswordSalesRepFailure),
                map(action => action.payload),
                tap(resp => {
                    const message =
                        this._handleErrMessage(resp) || 'Failed to change password sales rep';

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    changePasswordSalesRepSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.changePasswordSalesRepSuccess),
                map(action => action.payload),
                tap(resp => {
                    this.router.navigate(['/pages/sales-force/sales-rep']).finally(() => {
                        this._$notice.open('Successfully changed password sales rep', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [SALES REPS]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Sales Reps
     * @memberof SalesRepEffects
     */
    fetchSalesRepsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.fetchSalesRepsRequest),
            map(action => action.payload),
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
            switchMap(([params, data]: [IQueryParams, string | Auth]) => {
                if (!data) {
                    return of(
                        SalesRepActions.fetchSalesRepsFailure({
                            payload: new ErrorHandler({
                                id: 'fetchSalesRepsFailure',
                                errors: 'Not Found!'
                            })
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
                        SalesRepActions.fetchSalesRepsFailure({
                            payload: new ErrorHandler({
                                id: 'fetchSalesRepsFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                return this._$salesRepApi
                    .findAll<PaginateResponse<SalesRep>>(params, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                data: resp.data || [],
                                total: resp.total
                            };

                            return SalesRepActions.fetchSalesRepsSuccess({
                                payload: {
                                    ...newResp,
                                    data:
                                        newResp.data && newResp.data.length > 0
                                            ? newResp.data.map(r => new SalesRep(r))
                                            : []
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                SalesRepActions.fetchSalesRepsFailure({
                                    payload: new ErrorHandler({
                                        id: 'fetchSalesRepsFailure',
                                        errors: err
                                    })
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchSalesRepsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.fetchSalesRepsFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = this._handleErrMessage(resp);

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [SALES REP]
    // -----------------------------------------------------------------------------------------------------

    fetchSalesRepRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.fetchSalesRepRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([id, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then(user => (user ? [id, user] : [id, null]));
                }

                const { supplierId } = userSupplier;

                return of([id, supplierId]);
            }),
            switchMap(([id, data]: [string, string | Auth]) => {
                if (!data) {
                    return of(
                        SalesRepActions.fetchSalesRepFailure({
                            payload: new ErrorHandler({
                                id: 'fetchSalesRepFailure',
                                errors: 'Not Found!'
                            })
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
                        SalesRepActions.fetchSalesRepFailure({
                            payload: new ErrorHandler({
                                id: 'fetchSalesRepFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                return this._$salesRepApi.findById(id, supplierId).pipe(
                    catchOffline(),
                    map(resp => {
                        return SalesRepActions.fetchSalesRepSuccess({
                            payload: new SalesRep(resp)
                        });
                    }),
                    catchError(err =>
                        of(
                            SalesRepActions.fetchSalesRepFailure({
                                payload: new ErrorHandler({
                                    id: 'fetchSalesRepFailure',
                                    errors: err
                                })
                            })
                        )
                    )
                );
            })
        )
    );

    fetchSalesRepFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.fetchSalesRepFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = this._handleErrMessage(resp);

                    this._$notice.open(message, 'error', {
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
        private store: Store<fromSalesReps.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$salesRepApi: SalesRepApiService
    ) {}

    private _handleErrMessage(resp: ErrorHandler): string {
        if (typeof resp.errors === 'string') {
            return resp.errors;
        } else if (resp.errors.error && resp.errors.error.message) {
            return resp.errors.error.message;
        } else {
            return resp.errors.message;
        }
    }
}
