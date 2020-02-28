import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService, WarehouseValueApiService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, TNullable, User, WarehouseValue } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { FailureActions, WarehouseValueActions } from '../actions';

type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class WarehouseValueEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [WAREHOUSE VALUES]
    // -----------------------------------------------------------------------------------------------------

    fetchWarehouseValueRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseValueActions.fetchWarehouseValueRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._handleFetchWarehouseValueRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehouseValueFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._handleFetchWarehouseValueRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'fetchWarehouseValueFailure'))
                    );
                }
            })
        )
    );

    fetchWarehouseValueFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseValueActions.fetchWarehouseValueFailure),
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
        private _$warehouseValueApi: WarehouseValueApiService
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

    _handleFetchWarehouseValueRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = { ...params };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$warehouseValueApi.findAll<Array<WarehouseValue>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp =
                    (resp && resp.length > 0 ? resp.map(v => new WarehouseValue(v)) : []) || [];

                return WarehouseValueActions.fetchWarehouseValueSuccess({
                    payload: newResp
                });
            }),
            catchError(err => this.sendErrorToState$(err, 'fetchWarehouseValueFailure'))
        );
    };

    sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: FailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                WarehouseValueActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                WarehouseValueActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            WarehouseValueActions[dispatchTo]({
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
