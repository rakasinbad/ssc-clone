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

import { PayloadStoreChannel, StoreChannel, StoreSegment, StoreSegmentTree } from '../../models';
import {
    StoreChannelApiService,
    StoreChannelCrudApiService,
    StoreSegmentApiService
} from '../../services';
import { StoreChannelActions, StoreSegmentationFailureActions } from '../actions';
import * as fromStoreChannels from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class StoreChannelEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - STORE CHANNEL]
    // -----------------------------------------------------------------------------------------------------

    createStoreChannelRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreChannelActions.createStoreChannelRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [PayloadStoreChannel, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createStoreChannelRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'createStoreChannelFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, PayloadStoreChannel], Observable<AnyAction>>(
                            this._createStoreChannelRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'createStoreChannelFailure'))
                    );
                }
            })
        )
    );

    createStoreChannelFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreChannelActions.createStoreChannelFailure),
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

    createStoreChannelSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreChannelActions.createStoreChannelSuccess),
                tap(() => {
                    this._$notice.open('Successfully created store channel hierarchy', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [STORE CHANNELS]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreChannelsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreChannelActions.fetchStoreChannelsRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreChannelsRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreChannelsFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreChannelsRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreChannelsFailure'))
                    );
                }
            })
        )
    );

    fetchStoreChannelsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreChannelActions.fetchStoreChannelsFailure),
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
    // @ FETCH methods [STORE LAST CHANNEL]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreLastChannelRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreChannelActions.fetchStoreLastChannelRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreLastChannelRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStoreLastChannelFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreLastChannelRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStoreLastChannelFailure')
                        )
                    );
                }
            })
        )
    );

    fetchStoreLastChannelFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreChannelActions.fetchStoreLastChannelFailure),
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
    // @ REFRESH methods [STORE CHANNELS]
    // -----------------------------------------------------------------------------------------------------

    refreshStoreChannelsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreChannelActions.refreshStoreChannelsRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._refreshStoreChannelsRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'refreshStoreChannelsFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._refreshStoreChannelsRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'refreshStoreChannelsFailure')
                        )
                    );
                }
            })
        )
    );

    refreshStoreChannelsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreChannelActions.refreshStoreChannelsFailure),
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
        private store: Store<fromStoreChannels.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$storeSegmentApi: StoreSegmentApiService,
        private _$storeChannelApi: StoreChannelApiService,
        private _$storeChannelCrudCrudApi: StoreChannelCrudApiService
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

    _createStoreChannelRequest$ = ([userData, payload]: [User, PayloadStoreChannel]): Observable<
        AnyAction
    > => {
        const newPayload = new PayloadStoreChannel({ ...payload });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload.supplierId = supplierId;
        }

        return this._$storeChannelCrudCrudApi.create<PayloadStoreChannel>(newPayload).pipe(
            map(resp => {
                return StoreChannelActions.createStoreChannelSuccess();
            }),
            catchError(err => this._sendErrorToState$(err, 'createStoreChannelFailure'))
        );
    };

    _fetchStoreChannelsRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$storeChannelApi.findAll<StoreSegment<StoreChannel>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map(v => new StoreChannel(v))
                            : []) || [],
                    deepestLevel: resp.deepestLevel
                };

                return StoreChannelActions.fetchStoreChannelsSuccess({
                    payload: new StoreSegment(newResp.deepestLevel, newResp.data)
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'fetchStoreChannelsFailure'))
        );
    };

    _fetchStoreLastChannelRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        newParams['type'] = 'channel';

        return this._$storeSegmentApi.findAll<PaginateResponse<StoreSegmentTree>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map(v => new StoreSegmentTree(v))
                            : []) || [],
                    total: resp.total
                };

                return StoreChannelActions.fetchStoreLastChannelSuccess({
                    payload: newResp
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'fetchStoreLastChannelFailure'))
        );
    };

    _refreshStoreChannelsRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$storeChannelApi.findAll<StoreSegment<StoreChannel>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map(v => new StoreChannel(v))
                            : []) || [],
                    deepestLevel: resp.deepestLevel
                };

                return StoreChannelActions.refreshStoreChannelsSuccess({
                    payload: new StoreSegment(newResp.deepestLevel, newResp.data)
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'refreshStoreChannelsFailure'))
        );
    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: StoreSegmentationFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                StoreChannelActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                StoreChannelActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            StoreChannelActions[dispatchTo]({
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
