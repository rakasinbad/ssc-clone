import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

import { PayloadStockManagementCatalogue, StockManagementCatalogue } from '../../models';
import { StockHistoryApiService, StockManagementCatalogueApiService } from '../../services';
import { StockManagementCatalogueActions, StockManagementFailureActions } from '../actions';
import * as fromStockManagements from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class StockManagementCatalogueEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [UPDATE - STOCK MANAGEMENT CATALOGUE]
    // -----------------------------------------------------------------------------------------------------

    updateStockManagementCatalogueRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StockManagementCatalogueActions.updateStockManagementCatalogueRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(
                ([payload, authState]: [PayloadStockManagementCatalogue, TNullable<Auth>]) => {
                    if (!authState) {
                        return this._$helper.decodeUserToken().pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap(() => of(payload)),
                            switchMap<PayloadStockManagementCatalogue, Observable<AnyAction>>(
                                this._updateStockManagementCatalogueRequest$
                            ),
                            catchError(err =>
                                this._sendErrorToState$(
                                    err,
                                    'updateStockManagementCatalogueFailure'
                                )
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap(() => of(payload)),
                            switchMap<PayloadStockManagementCatalogue, Observable<AnyAction>>(
                                this._updateStockManagementCatalogueRequest$
                            ),
                            catchError(err =>
                                this._sendErrorToState$(
                                    err,
                                    'updateStockManagementCatalogueFailure'
                                )
                            )
                        );
                    }
                }
            )
        )
    );

    updateStockManagementCatalogueFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StockManagementCatalogueActions.updateStockManagementCatalogueFailure),
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
    // @ FETCH methods [STOCK MANAGEMENT CATALOGUES]
    // -----------------------------------------------------------------------------------------------------

    fetchStockManagementCataloguesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StockManagementCatalogueActions.fetchStockManagementCataloguesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(
                ([payload, authState]: [
                    { params: IQueryParams; warehouseId: string },
                    TNullable<Auth>
                ]) => {
                    if (!authState) {
                        return this._$helper.decodeUserToken().pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap(() => of([payload.params, payload.warehouseId])),
                            switchMap<[IQueryParams, string], Observable<AnyAction>>(
                                this._fetchStockManagementCataloguesRequest$
                            ),
                            catchError(err =>
                                this._sendErrorToState$(
                                    err,
                                    'fetchStockManagementCataloguesFailure'
                                )
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap(() => of([payload.params, payload.warehouseId])),
                            switchMap<[IQueryParams, string], Observable<AnyAction>>(
                                this._fetchStockManagementCataloguesRequest$
                            ),
                            catchError(err =>
                                this._sendErrorToState$(
                                    err,
                                    'fetchStockManagementCataloguesFailure'
                                )
                            )
                        );
                    }
                }
            )
        )
    );

    fetchStockManagementCataloguesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StockManagementCatalogueActions.fetchStockManagementCataloguesFailure),
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
        private store: Store<fromStockManagements.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$stockHistoryApi: StockHistoryApiService,
        private _$stockManagementCatalogueApi: StockManagementCatalogueApiService
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

    _updateStockManagementCatalogueRequest$ = (
        payload: PayloadStockManagementCatalogue
    ): Observable<AnyAction> => {
        return this._$stockHistoryApi.update<PayloadStockManagementCatalogue>(payload).pipe(
            map(resp => {
                return StockManagementCatalogueActions.updateStockManagementCatalogueSuccess();
            }),
            catchError(err => this._sendErrorToState$(err, 'updateStockManagementCatalogueFailure'))
        );
    };

    _fetchStockManagementCataloguesRequest$ = ([params, warehouseId]: [
        IQueryParams,
        string
    ]): Observable<AnyAction> => {
        const newParams = {
            ...params
        };

        if (warehouseId) {
            newParams['warehouseId'] = warehouseId;
        } else {
            throw new ErrorHandler({
                id: 'ERR_WAREHOUSE_ID_NOT_FOUND',
                errors: 'WarehouseID is required'
            });
        }

        return this._$stockManagementCatalogueApi
            .findAll<PaginateResponse<StockManagementCatalogue>>(newParams)
            .pipe(
                catchOffline(),
                map(resp => {
                    const newResp = {
                        data:
                            (resp.data && resp.data.length > 0
                                ? resp.data.map(v => new StockManagementCatalogue(v))
                                : []) || [],
                        total: resp.total
                    };

                    return StockManagementCatalogueActions.fetchStockManagementCataloguesSuccess({
                        payload: newResp
                    });
                }),
                catchError(err =>
                    this._sendErrorToState$(err, 'fetchStockManagementCataloguesFailure')
                )
            );
    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: StockManagementFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                StockManagementCatalogueActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                StockManagementCatalogueActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            StockManagementCatalogueActions[dispatchTo]({
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
