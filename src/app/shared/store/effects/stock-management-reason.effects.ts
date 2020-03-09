import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService, StockManagementReasonApiService } from 'app/shared/helpers';
import { ErrorHandler, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { StockManagementReason } from 'app/shared/models/stock-management-reason.model';
import { User } from 'app/shared/models/user.model';
import * as fromRoot from 'app/store/app.reducer';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, withLatestFrom, tap } from 'rxjs/operators';

import { FailureActions, StockManagementReasonActions } from '../actions';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class StockManagementReasonEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [STOCK MANAGEMEN REASON]
    // -----------------------------------------------------------------------------------------------------

    fetchStockManagementReasonRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StockManagementReasonActions.fetchStockManagementReasonRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(
                ([payload, authState]: [
                    { params: IQueryParams; method: string },
                    TNullable<Auth>
                ]) => {
                    if (!authState) {
                        return this._$helper.decodeUserToken().pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap(() => of({ params: payload.params, method: payload.method })),
                            switchMap<
                                { params: IQueryParams; method: string },
                                Observable<AnyAction>
                            >(this._fetchStockManagementReasonRequest$),
                            catchError(err =>
                                this._sendErrorToState$(err, 'fetchStockManagementReasonFailure')
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap(() => of({ params: payload.params, method: payload.method })),
                            switchMap<
                                { params: IQueryParams; method: string },
                                Observable<AnyAction>
                            >(this._fetchStockManagementReasonRequest$),
                            catchError(err =>
                                this._sendErrorToState$(err, 'fetchStockManagementReasonFailure')
                            )
                        );
                    }
                }
            )
        )
    );

    fetchStockManagementReasonFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StockManagementReasonActions.fetchStockManagementReasonFailure),
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
        private store: Store<fromRoot.State>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$stockManagementReasonApi: StockManagementReasonApiService
    ) {}

    checkUserSupplier = (userData: User): User => {
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

    _fetchStockManagementReasonRequest$ = ({
        params,
        method
    }: {
        params: IQueryParams;
        method: string;
    }): Observable<AnyAction> => {
        const newParams = {
            ...params,
            paginate: false
        };

        if (method) {
            newParams['method'] = method;
        }

        return this._$stockManagementReasonApi.findAll<Array<StockManagementReason>>(params).pipe(
            catchOffline(),
            map(resp => {
                const newResp =
                    (resp && resp.length > 0 ? resp.map(v => new StockManagementReason(v)) : []) ||
                    [];

                return StockManagementReasonActions.fetchStockManagementReasonSuccess({
                    payload: newResp
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'fetchStockManagementReasonFailure'))
        );
    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: FailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                StockManagementReasonActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                StockManagementReasonActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            StockManagementReasonActions[dispatchTo]({
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
