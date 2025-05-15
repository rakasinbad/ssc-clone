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

import { StoreSegmentAlert } from '../../models';
import { StoreSegmentAlertApiService } from '../../services';
import { StoreAlertActions, StoreSegmentationFailureActions } from '../actions';
import * as fromStoreSegments from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class StoreSegmentAlertEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [STORE TYPES]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreAlertRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreAlertActions.fetchStoreAlertRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreAlertRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreAlertFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreAlertRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreAlertFailure'))
                    );
                }
            })
        )
    );

    fetchStoreAlertFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreAlertActions.fetchStoreAlertFailure),
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
        private store: Store<fromStoreSegments.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$storeSegmentAlertApi: StoreSegmentAlertApiService
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

    _fetchStoreAlertRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$storeSegmentAlertApi
            .findAll<PaginateResponse<StoreSegmentAlert>>(newParams)
            .pipe(
                catchOffline(),
                map(resp => {
                    const newResp = {
                        data:
                            (resp && resp.data.length > 0
                                ? resp.data.map(v => new StoreSegmentAlert(v))
                                : []) || [],
                        total: resp.total
                    };

                    return StoreAlertActions.fetchStoreAlertSuccess({
                        payload: newResp
                    });
                }),
                catchError(err => this._sendErrorToState$(err, 'fetchStoreAlertFailure'))
            );
    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: StoreSegmentationFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                StoreAlertActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                StoreAlertActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            StoreAlertActions[dispatchTo]({
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
