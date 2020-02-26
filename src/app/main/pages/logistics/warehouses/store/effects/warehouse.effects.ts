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
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Warehouse } from '../../models';
import { WarehouseApiService } from '../../services';
import { WarehouseActions, WarehouseFailureActions } from '../actions';
import * as fromWarehouses from '../reducers';

type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class WarehouseEffects {
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
                            this.fetchWareousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehousesFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.fetchWareousesRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehousesFailure'))
                    );
                }
            })
        )
    );

    fetchSalesRepFailure$ = createEffect(
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

    fetchWareousesRequest$ = ([userData, params]: [User, IQueryParams]): Observable<AnyAction> => {
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

    sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: WarehouseFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                WarehouseActions[dispatchTo]({
                    payload: err
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                WarehouseActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: err
                    }
                })
            );
        }

        return of(
            WarehouseActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err
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
