import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { StockManagement } from '../../models';
import { StockManagementApiService } from '../../services';
import { StockManagementActions, StockManagementFailureActions } from '../actions';
import * as fromStockManagements from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class StockManagementEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [STOCK MANAGEMENTS]
    // -----------------------------------------------------------------------------------------------------

    fetchStockManagementsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StockManagementActions.fetchStockManagementsRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStockManagementsRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStockManagementsFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStockManagementsRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStockManagementsFailure')
                        )
                    );
                }
            })
        )
    );

    fetchStockManagementsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StockManagementActions.fetchStockManagementsFailure),
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
    // @ FETCH methods [STOCK MANAGEMENT]
    // -----------------------------------------------------------------------------------------------------

    fetchStockManagementRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StockManagementActions.fetchStockManagementRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([id, authState]: [string, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([id, userData])),
                        switchMap<[string, User], Observable<AnyAction>>(
                            this._fetchStockManagementRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStockManagementFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([id, userData])),
                        switchMap<[string, User], Observable<AnyAction>>(
                            this._fetchStockManagementRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStockManagementFailure')
                        )
                    );
                }
            })
        )
    );

    fetchStockManagementFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StockManagementActions.fetchStockManagementFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = this._handleErrMessage(resp);

                    this.router.navigateByUrl('/pages/logistics/stock-managements').finally(() => {
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
        private router: Router,
        private store: Store<fromStockManagements.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$stockManagementApi: StockManagementApiService
    ) {}

    _checkUserSupplier = (userData: User): User => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throw new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`
            });
        }

        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    };

    _fetchStockManagementsRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$stockManagementApi.findAll<PaginateResponse<StockManagement>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp.data && resp.data.length > 0
                            ? resp.data.map(v => new StockManagement(v))
                            : []) || [],
                    total: resp.total
                };

                return StockManagementActions.fetchStockManagementsSuccess({
                    payload: newResp
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'fetchStockManagementsFailure'))
        );
    };

    _fetchStockManagementRequest$ = ([warehouseId, userData]: [string, User]): Observable<
        AnyAction
    > => {
        const { supplierId } = userData.userSupplier;

        if (!warehouseId) {
            throw new ErrorHandler({
                id: 'ERR_WAREHOUSE_ID_NOT_FOUND',
                errors: 'WarehouseID is required'
            });
        }

        return this._$stockManagementApi.findById(warehouseId, supplierId).pipe(
            catchOffline(),
            map(resp =>
                StockManagementActions.fetchStockManagementSuccess({
                    payload: new StockManagement(resp)
                })
            ),
            catchError(err => this._sendErrorToState$(err, 'fetchStockManagementFailure'))
        );
    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: StockManagementFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                StockManagementActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                StockManagementActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            StockManagementActions[dispatchTo]({
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
