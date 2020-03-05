import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService, TemperatureApiService } from 'app/shared/helpers';
import { ErrorHandler, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Temperature } from 'app/shared/models/temperature.model';
import { User } from 'app/shared/models/user.model';
import * as fromRoot from 'app/store/app.reducer';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { TemperatureActions } from '../actions';
import { FailureActions } from './../actions/temperature.actions';

type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class TemperatureEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [TEMPERATURES]
    // -----------------------------------------------------------------------------------------------------

    fetchTemperatureRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TemperatureActions.fetchTemperatureRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._handleFetchTemperatureRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'fetchTemperatureFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._handleFetchTemperatureRequest$
                        ),
                        catchError(err => this.sendErrorToState$(err, 'fetchTemperatureFailure'))
                    );
                }
            })
        )
    );

    fetchTemperatureFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TemperatureActions.fetchTemperatureFailure),
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
        private _$temperatureApi: TemperatureApiService
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

    _handleFetchTemperatureRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = { ...params };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$temperatureApi.findAll<Array<Temperature>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp =
                    (resp && resp.length > 0 ? resp.map(v => new Temperature(v)) : []) || [];

                return TemperatureActions.fetchTemperatureSuccess({
                    payload: newResp
                });
            }),
            catchError(err => this.sendErrorToState$(err, 'fetchTemperatureFailure'))
        );
    };

    sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: FailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                TemperatureActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                TemperatureActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            TemperatureActions[dispatchTo]({
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
