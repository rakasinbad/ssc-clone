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
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, PaginateResponse, TNullable, User } from 'app/shared/models';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom, finalize } from 'rxjs/operators';

import { Warehouse } from '../../models';
import { WarehouseApiService } from '../../services';
import { WarehouseActions, WarehouseFailureActions } from '../actions';
import * as fromWarehouses from '../reducers';
import { FormActions } from 'app/shared/store/actions';

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
                            this.handleCreateWarehousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'createWarehouseFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this.handleCreateWarehousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'createWarehouseFailure'))
                    );
                }
            })
        )
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
                            this.handleFetchWarehousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehousesFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.handleFetchWarehousesRequest$
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
                        switchMap<string, Observable<AnyAction>>(this.handleFetchWarehouseRequest$),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehouseFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(() => of(id)),
                        switchMap<string, Observable<AnyAction>>(this.handleFetchWarehouseRequest$),
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
        private _$warehouseApi: WarehouseApiService
    ) {}

    checkUserSupplier = (userData: User): User => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throwError(
                new ErrorHandler({
                    id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                    errors: `User Data: ${userData}`
                })
            );
        }

        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    };

    handleCreateWarehousesRequest$ = ([userData, payload]: [User, any]): Observable<AnyAction> => {
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

    handleFetchWarehousesRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
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

    handleFetchWarehouseRequest$ = (warehouseId: string): Observable<AnyAction> => {
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
