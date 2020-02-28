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
import { HelperService, NoticeService, WarehouseCatalogueApiService } from 'app/shared/helpers';
import {
    ErrorHandler,
    IQueryParams,
    PaginateResponse,
    TNullable,
    User,
    WarehouseCatalogue
} from 'app/shared/models';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { WarehouseFailureActions, WarehouseSkuStockActions } from '../actions';
import * as fromWarehouses from '../reducers';

type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class WarehouseSkuStockEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [WAREHOUSE SKU STOCKS]
    // -----------------------------------------------------------------------------------------------------

    fetchWarehouseSkuStocksRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseSkuStockActions.fetchWarehouseSkuStocksRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(
                ([{ params, warehouseId }, authState]: [
                    { params: IQueryParams; warehouseId: string },
                    TNullable<Auth>
                ]) => {
                    if (!authState) {
                        return this._$helper.decodeUserToken().pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap(() => of([warehouseId, params])),
                            switchMap<[string, IQueryParams], Observable<AnyAction>>(
                                this.fetchWareouseSkuStocksRequest$
                            ),
                            catchError(err =>
                                this.sendErrorToState$(err, 'fetchWarehouseSkuStocksFailure')
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap(() => of([warehouseId, params])),
                            switchMap<[string, IQueryParams], Observable<AnyAction>>(
                                this.fetchWareouseSkuStocksRequest$
                            ),
                            catchError(err =>
                                this.sendErrorToState$(err, 'fetchWarehouseSkuStocksFailure')
                            )
                        );
                    }
                }
            )
        )
    );

    fetchWarehouseSkuStocksFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseSkuStockActions.fetchWarehouseSkuStocksFailure),
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
        private _$warehouseCatalogueApi: WarehouseCatalogueApiService
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

    fetchWareouseSkuStocksRequest$ = ([warehouseId, params]: [string, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = { ...params };

        if (warehouseId) {
            newParams['warehouseId'] = warehouseId;
        }

        return this._$warehouseCatalogueApi
            .findAll<PaginateResponse<WarehouseCatalogue>>(newParams)
            .pipe(
                catchOffline(),
                map(resp => {
                    const newResp = {
                        data:
                            (resp.data && resp.data.length > 0
                                ? resp.data.map(v => new WarehouseCatalogue(v))
                                : []) || [],
                        total: resp.total
                    };

                    return WarehouseSkuStockActions.fetchWarehouseSkuStocksSuccess({
                        payload: newResp
                    });
                }),
                catchError(err => this.sendErrorToState$(err, 'fetchWarehouseSkuStocksFailure'))
            );
    };

    sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: WarehouseFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                WarehouseSkuStockActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                WarehouseSkuStockActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            WarehouseSkuStockActions[dispatchTo]({
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
