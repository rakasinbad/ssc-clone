import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService, WarehouseConfirmationApiService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import {
    PayloadWarehouseConfirmation,
    WarehouseConfirmation
} from 'app/shared/models/warehouse-confirmation.model';
import { FormActions } from 'app/shared/store/actions';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Warehouse } from '../../models';
import { WarehouseApiService } from '../../services';
import { WarehouseActions, WarehouseFailureActions } from '../actions';
import * as fromWarehouses from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class WarehouseEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - WAREHOUSE]
    // -----------------------------------------------------------------------------------------------------

    createWarehouseRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseActions.createWarehouseRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [any, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createWarehousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'createWarehouseFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createWarehousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'createWarehouseFailure'))
                    );
                }
            })
        )
    );

    createWarehouseFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseActions.createWarehouseFailure),
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

    createWarehouseSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseActions.createWarehouseSuccess),
                tap(() => {
                    this.router.navigate(['/pages/logistics/warehouses']).finally(() => {
                        this._$notice.open('Successfully created warehouse', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [UPDATE - WAREHOUSE]
    // -----------------------------------------------------------------------------------------------------

    updateWarehouseRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseActions.updateWarehouseRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [{ body: any; id: string }, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload.body, payload.id])),
                        switchMap<[User, any, string], Observable<AnyAction>>(
                            this._updateWarehousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'updateWarehouseFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload.body, payload.id])),
                        switchMap<[User, any, string], Observable<AnyAction>>(
                            this._updateWarehousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'updateWarehouseFailure'))
                    );
                }
            })
        )
    );

    updateWarehouseFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseActions.updateWarehouseFailure),
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

    updateWarehouseSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseActions.updateWarehouseSuccess),
                tap(() => {
                    this.router.navigate(['/pages/logistics/warehouses']).finally(() => {
                        this._$notice.open('Successfully created warehouse', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [WAREHOUSES]
    // -----------------------------------------------------------------------------------------------------

    fetchWarehousesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseActions.fetchWarehousesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchWarehousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehousesFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchWarehousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehousesFailure'))
                    );
                }
            })
        )
    );

    fetchWarehousesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseActions.fetchWarehousesFailure),
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
    // @ FETCH methods [WAREHOUSE]
    // -----------------------------------------------------------------------------------------------------

    fetchWarehouseRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseActions.fetchWarehouseRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([id, authState]: [string, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(() => of(id)),
                        switchMap<string, Observable<AnyAction>>(this._fetchWarehouseRequest$),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehouseFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(() => of(id)),
                        switchMap<string, Observable<AnyAction>>(this._fetchWarehouseRequest$),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehouseFailure'))
                    );
                }
            })
        )
    );

    fetchWarehouseFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseActions.fetchWarehouseFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = this._handleErrMessage(resp);

                    this.router.navigateByUrl('/pages/logistics/warehouses').finally(() => {
                        this._$notice.open(message, 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ HELPER methods [WAREHOUSE INVOICE CONFIRMATION]
    // -----------------------------------------------------------------------------------------------------

    confirmationChangeInvoiceRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseActions.confirmationChangeInvoiceRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [PayloadWarehouseConfirmation, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(() => of(payload)),
                        switchMap<PayloadWarehouseConfirmation, Observable<AnyAction>>(
                            this._confirmationChangeInvoiceRequest$
                        ),
                        catchError(err =>
                            this.sendErrorToState$(err, 'confirmationChangeInvoiceFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(() => of(payload)),
                        switchMap<PayloadWarehouseConfirmation, Observable<AnyAction>>(
                            this._confirmationChangeInvoiceRequest$
                        ),
                        catchError(err =>
                            this.sendErrorToState$(err, 'confirmationChangeInvoiceFailure')
                        )
                    );
                }
            })
        )
    );

    confirmationChangeInvoiceFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseActions.confirmationChangeInvoiceFailure),
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
        private store: Store<fromWarehouses.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$warehouseApi: WarehouseApiService,
        private _$warehouseConfirmationApi: WarehouseConfirmationApiService
    ) {}

    checkUserSupplier = (userData: User): User => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            // throwError(
            //     new ErrorHandler({
            //         id: 'ERR_USER_SUPPLIER_NOT_FOUND',
            //         errors: `User Data: ${userData}`
            //     })
            // );
            throw new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`
            });
        }

        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    };

    _createWarehousesRequest$ = ([userData, payload]: [User, any]): Observable<AnyAction> => {
        const newPayload = {
            ...payload
        };

        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload['supplierId'] = supplierId;
        }

        return this._$warehouseApi.create<any>(newPayload).pipe(
            map(resp => {
                return WarehouseActions.createWarehouseSuccess();
            }),
            catchError(err => this.sendErrorToState$(err, 'createWarehouseFailure')),
            finalize(() => {
                this.store.dispatch(FormActions.resetClickSaveButton());
            })
        );
    };

    _updateWarehousesRequest$ = ([userData, body, id]: [User, any, string]): Observable<
        AnyAction
    > => {
        const newPayload = {
            ...body
        };

        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload['supplierId'] = supplierId;
        }

        if (!id) {
            throw new ErrorHandler({
                id: 'ERR_NOT_SELECTED_ID',
                errors: 'Please selected warehouse id'
            });
        }

        return this._$warehouseApi.patch<any>(newPayload, id).pipe(
            map(resp => {
                return WarehouseActions.updateWarehouseSuccess();
            }),
            catchError(err => this.sendErrorToState$(err, 'updateWarehouseFailure')),
            finalize(() => {
                this.store.dispatch(FormActions.resetClickSaveButton());
            })
        );
    };

    _fetchWarehousesRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const { supplierId } = userData.userSupplier;

        return this._$warehouseApi.findAll<PaginateResponse<Warehouse>>(params, supplierId).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp.data && resp.data.length > 0
                            ? resp.data.map(v => new Warehouse(v))
                            : []) || [],
                    total: resp.total
                };

                return WarehouseActions.fetchWarehousesSuccess({
                    payload: newResp
                });
            }),
            catchError(err => this.sendErrorToState$(err, 'fetchWarehousesFailure'))
        );
    };

    _fetchWarehouseRequest$ = (warehouseId: string): Observable<AnyAction> => {
        return this._$warehouseApi.findById(warehouseId).pipe(
            catchOffline(),
            map(resp =>
                WarehouseActions.fetchWarehouseSuccess({
                    payload: new Warehouse(resp)
                })
            ),
            catchError(err => this.sendErrorToState$(err, 'fetchWarehouseFailure'))
        );
    };

    _confirmationChangeInvoiceRequest$ = (
        payload: PayloadWarehouseConfirmation
    ): Observable<AnyAction> => {
        return this._$warehouseConfirmationApi.check(payload).pipe(
            map(resp => {
                return WarehouseActions.confirmationChangeInvoiceSuccess({
                    payload: new WarehouseConfirmation({
                        ...resp,
                        invoiceId: payload.invoiceGroupId
                    })
                });
            }),
            catchError(err => this.sendErrorToState$(err, 'confirmationChangeInvoiceFailure'))
        );
    };

    sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: WarehouseFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                WarehouseActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                WarehouseActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            WarehouseActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                }
            })
        );
    };

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
