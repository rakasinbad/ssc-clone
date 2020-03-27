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
import { ErrorHandler, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { PayloadStoreType, StoreSegment, StoreType } from '../../models';
import { StoreTypeApiService, StoreTypeCrudApiService } from '../../services';
import { StoreSegmentationFailureActions, StoreTypeActions } from '../actions';
import * as fromStoreSegments from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class StoreTypeEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - STORE TYPE]
    // -----------------------------------------------------------------------------------------------------

    createStoreTypeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreTypeActions.createStoreTypeRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [PayloadStoreType, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createStoreTypeRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'createStoreTypeFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, PayloadStoreType], Observable<AnyAction>>(
                            this._createStoreTypeRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'createStoreTypeFailure'))
                    );
                }
            })
        )
    );

    createStoreTypeFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreTypeActions.createStoreTypeFailure),
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

    createStoreTypeSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreTypeActions.createStoreTypeSuccess),
                tap(() => {
                    this._$notice.open('Successfully created store type hierarchy', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [STORE TYPES]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreTypesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreTypeActions.fetchStoreTypesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreTypesRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreTypesFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreTypesRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreTypesFailure'))
                    );
                }
            })
        )
    );

    fetchStoreTypesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreTypeActions.fetchStoreTypesFailure),
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
    // @ REFRESH methods [STORE TYPES]
    // -----------------------------------------------------------------------------------------------------

    refreshStoreTypesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreTypeActions.refreshStoreTypesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._refreshStoreTypesRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'refreshStoreTypesFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._refreshStoreTypesRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'refreshStoreTypesFailure'))
                    );
                }
            })
        )
    );

    refreshStoreTypesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreTypeActions.refreshStoreTypesFailure),
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
        private router: Router,
        private store: Store<fromStoreSegments.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$storeTypeApi: StoreTypeApiService,
        private _$storeTypeCrudApi: StoreTypeCrudApiService
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

    _createStoreTypeRequest$ = ([userData, payload]: [User, PayloadStoreType]): Observable<
        AnyAction
    > => {
        const newPayload = new PayloadStoreType({ ...payload });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload.supplierId = supplierId;
        }

        return this._$storeTypeCrudApi.create<PayloadStoreType>(newPayload).pipe(
            map(resp => {
                return StoreTypeActions.createStoreTypeSuccess();
            }),
            catchError(err => this._sendErrorToState$(err, 'createStoreTypeFailure'))
        );
    };

    _fetchStoreTypesRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$storeTypeApi.findAll<StoreSegment<StoreType>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map(v => new StoreType(v))
                            : []) || [],
                    deepestLevel: resp.deepestLevel
                };

                return StoreTypeActions.fetchStoreTypesSuccess({
                    payload: new StoreSegment(newResp.deepestLevel, newResp.data)
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'fetchStoreTypesFailure'))
        );
    };

    _refreshStoreTypesRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$storeTypeApi.findAll<StoreSegment<StoreType>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map(v => new StoreType(v))
                            : []) || [],
                    deepestLevel: resp.deepestLevel
                };

                return StoreTypeActions.refreshStoreTypesSuccess({
                    payload: new StoreSegment(newResp.deepestLevel, newResp.data)
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'refreshStoreTypesFailure'))
        );
    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: StoreSegmentationFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                StoreTypeActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                StoreTypeActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            StoreTypeActions[dispatchTo]({
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
