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
import { HelperService, NoticeService, WarehouseCoverageApiService } from 'app/shared/helpers';
import {
    ErrorHandler,
    IQueryParams,
    PaginateResponse,
    TNullable,
    User,
    WarehouseCoverage
} from 'app/shared/models';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { WarehouseCoverageActions, WarehouseFailureActions } from '../actions';
import * as fromWarehouseCoverages from '../reducers';

type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class WarehouseCoverageEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [WAREHOUSES]
    // -----------------------------------------------------------------------------------------------------

    fetchWarehouseCoveragesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseCoverageActions.fetchWarehouseCoveragesRequest),
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
                                this.fetchWareouseCoveragesRequest$
                            ),
                            catchError(err =>
                                this.sendErrorToState$(err, 'fetchWarehouseCoveragesFailure')
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap(() => of([warehouseId, params])),
                            switchMap<[string, IQueryParams], Observable<AnyAction>>(
                                this.fetchWareouseCoveragesRequest$
                            ),
                            catchError(err =>
                                this.sendErrorToState$(err, 'fetchWarehouseCoveragesFailure')
                            )
                        );
                    }
                }
            )
        )
    );

    fetchWarehouseCoveragesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(WarehouseCoverageActions.fetchWarehouseCoveragesFailure),
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
        private store: Store<fromWarehouseCoverages.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$warehouseCoverageApi: WarehouseCoverageApiService
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

    fetchWareouseCoveragesRequest$ = ([warehosueId, params]: [string, IQueryParams]): Observable<
        AnyAction
    > => {
        return this._$warehouseCoverageApi
            .findByWarehouseId<PaginateResponse<WarehouseCoverage>>(params, warehosueId)
            .pipe(
                catchOffline(),
                map(resp => {
                    const newResp = {
                        data:
                            (resp.data && resp.data.length > 0
                                ? resp.data.map(v => new WarehouseCoverage(v))
                                : []) || [],
                        total: resp.total
                    };

                    return WarehouseCoverageActions.fetchWarehouseCoveragesSuccess({
                        payload: newResp
                    });
                }),
                catchError(err => this.sendErrorToState$(err, 'fetchWarehouseCoveragesFailure'))
            );
    };

    sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: WarehouseFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                WarehouseCoverageActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                WarehouseCoverageActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            WarehouseCoverageActions[dispatchTo]({
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
