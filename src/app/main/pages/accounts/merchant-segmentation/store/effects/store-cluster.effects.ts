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

import {
    PayloadStoreCluster,
    PayloadStoreClusterPatch,
    StoreCluster,
    StoreSegment,
    StoreSegmentTree
} from '../../models';
import {
    StoreClusterApiService,
    StoreClusterCrudApiService,
    StoreSegmentApiService
} from '../../services';
import { StoreClusterActions, StoreSegmentationFailureActions } from '../actions';
import * as fromStoreChannels from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class StoreClusterEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - STORE CLUSTER]
    // -----------------------------------------------------------------------------------------------------

    createStoreClusterRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreClusterActions.createStoreClusterRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [PayloadStoreCluster, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createStorClusterRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'createStoreClusterFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, PayloadStoreCluster], Observable<AnyAction>>(
                            this._createStorClusterRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'createStoreClusterFailure'))
                    );
                }
            })
        )
    );

    createStoreClusterFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreClusterActions.createStoreClusterFailure),
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
                ofType(StoreClusterActions.createStoreClusterSuccess),
                tap(() => {
                    this._$notice.open('Successfully created store cluster hierarchy', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [UPDATE - STORE CLUSTER]
    // -----------------------------------------------------------------------------------------------------

    updateStoreClusterRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreClusterActions.updateStoreClusterRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(
                ([payload, authState]: [
                    { body: PayloadStoreClusterPatch; id: string },
                    TNullable<Auth>
                ]) => {
                    if (!authState) {
                        return this._$helper.decodeUserToken().pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap(userData => of([userData, payload])),
                            switchMap<
                                [User, { body: PayloadStoreClusterPatch; id: string }],
                                Observable<AnyAction>
                            >(this._updateStoreClusterRequest$),
                            catchError(err =>
                                this._sendErrorToState$(err, 'updateStoreClusterFailure')
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap(userData => of([userData, payload])),
                            switchMap<
                                [User, { body: PayloadStoreClusterPatch; id: string }],
                                Observable<AnyAction>
                            >(this._updateStoreClusterRequest$),
                            catchError(err =>
                                this._sendErrorToState$(err, 'updateStoreClusterFailure')
                            )
                        );
                    }
                }
            )
        )
    );

    updateStoreClusterFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreClusterActions.updateStoreClusterFailure),
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

    updateStoreClusterSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreClusterActions.updateStoreClusterSuccess),
                tap(() => {
                    this._$notice.open('Successfully updated store cluster hierarchy', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [STORE CLUSTERS]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreClustersRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreClusterActions.fetchStoreClustersRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreClustersRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreClustersFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreClustersRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreClustersFailure'))
                    );
                }
            })
        )
    );

    fetchStoreClustersFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreClusterActions.fetchStoreClustersFailure),
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
    // @ FETCH methods [STORE LAST CLUSTER]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreLastClusterRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreClusterActions.fetchStoreLastClusterRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreLastClusterRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStoreLastClusterFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreLastClusterRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStoreLastClusterFailure')
                        )
                    );
                }
            })
        )
    );

    fetchStoreLastClusterFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreClusterActions.fetchStoreLastClusterFailure),
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
    // @ REFRESH methods [STORE CLUSTERS]
    // -----------------------------------------------------------------------------------------------------

    refreshStoreClustersRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreClusterActions.refreshStoreClustersRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._refreshStoreClustersRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'refreshStoreClustersFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._refreshStoreClustersRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'refreshStoreClustersFailure')
                        )
                    );
                }
            })
        )
    );

    refreshStoreClustersFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreClusterActions.refreshStoreClustersFailure),
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
        private _$storeClusterApi: StoreClusterApiService,
        private _$storeClusterCrudCrudApi: StoreClusterCrudApiService
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

    _createStorClusterRequest$ = ([userData, payload]: [User, PayloadStoreCluster]): Observable<
        AnyAction
    > => {
        const newPayload = new PayloadStoreCluster({ ...payload });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload.supplierId = supplierId;
        }

        return this._$storeClusterCrudCrudApi.create<PayloadStoreCluster>(newPayload).pipe(
            map(resp => {
                return StoreClusterActions.createStoreClusterSuccess();
            }),
            catchError(err => this._sendErrorToState$(err, 'createStoreClusterFailure'))
        );
    };

    _updateStoreClusterRequest$ = ([userData, { body, id }]: [
        User,
        { body: PayloadStoreClusterPatch; id: string }
    ]): Observable<AnyAction> => {
        if (!id || !Object.keys(body).length) {
            throw new ErrorHandler({
                id: 'ERR_ID_OR_PAYLOAD_NOT_FOUND',
                errors: 'Check id or payload'
            });
        }

        return this._$storeClusterCrudCrudApi.patch<PayloadStoreClusterPatch>(body, id).pipe(
            map(resp => {
                return StoreClusterActions.updateStoreClusterSuccess();
            }),
            catchError(err => this._sendErrorToState$(err, 'updateStoreClusterFailure'))
        );
    };

    _fetchStoreClustersRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$storeClusterApi.findAll<StoreSegment<StoreCluster>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map(v => new StoreCluster(v))
                            : []) || [],
                    deepestLevel: resp.deepestLevel
                };

                return StoreClusterActions.fetchStoreClustersSuccess({
                    payload: new StoreSegment(newResp.deepestLevel, newResp.data)
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'fetchStoreClustersFailure'))
        );
    };

    _fetchStoreLastClusterRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        newParams['type'] = 'cluster';

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

                return StoreClusterActions.fetchStoreLastClusterSuccess({
                    payload: newResp
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'fetchStoreLastClusterFailure'))
        );
    };

    _refreshStoreClustersRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$storeClusterApi.findAll<StoreSegment<StoreCluster>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map(v => new StoreCluster(v))
                            : []) || [],
                    deepestLevel: resp.deepestLevel
                };

                return StoreClusterActions.refreshStoreClustersSuccess({
                    payload: new StoreSegment(newResp.deepestLevel, newResp.data)
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'refreshStoreClustersFailure'))
        );
    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: StoreSegmentationFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                StoreClusterActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                StoreClusterActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            StoreClusterActions[dispatchTo]({
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
