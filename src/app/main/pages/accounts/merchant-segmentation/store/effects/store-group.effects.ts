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

import { PayloadStoreGroup, StoreGroup, StoreSegment, StoreSegmentTree } from '../../models';
import {
    StoreGroupApiService,
    StoreGroupCrudApiService,
    StoreSegmentApiService
} from '../../services';
import { StoreGroupActions, StoreSegmentationFailureActions } from '../actions';
import * as fromStoreSegments from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class StoreGroupEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - STORE TYPE]
    // -----------------------------------------------------------------------------------------------------

    createStoreGroupRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreGroupActions.createStoreGroupRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [PayloadStoreGroup, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createStoreGroupRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'createStoreGroupFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, PayloadStoreGroup], Observable<AnyAction>>(
                            this._createStoreGroupRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'createStoreGroupFailure'))
                    );
                }
            })
        )
    );

    createStoreGroupFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreGroupActions.createStoreGroupFailure),
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

    createStoreGroupSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreGroupActions.createStoreGroupSuccess),
                tap(() => {
                    this._$notice.open('Successfully created store group hierarchy', 'success', {
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

    fetchStoreGroupsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreGroupActions.fetchStoreGroupsRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreGroupsRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreGroupsFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreGroupsRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'fetchStoreGroupsFailure'))
                    );
                }
            })
        )
    );

    fetchStoreGroupsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreGroupActions.fetchStoreGroupsFailure),
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
    // @ FETCH methods [STORE LAST GROUP]
    // -----------------------------------------------------------------------------------------------------

    fetchStoreLastGroupRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreGroupActions.fetchStoreLastGroupRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreLastGroupRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStoreLastGroupFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchStoreLastGroupRequest$
                        ),
                        catchError(err =>
                            this._sendErrorToState$(err, 'fetchStoreLastGroupFailure')
                        )
                    );
                }
            })
        )
    );

    fetchStoreLastGroupFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreGroupActions.fetchStoreLastGroupFailure),
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
    // @ REFRESH methods [STORE GROUPS]
    // -----------------------------------------------------------------------------------------------------

    refreshStoreGroupsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StoreGroupActions.refreshStoreGroupsRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._refreshStoreGroupsRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'refreshStoreGroupsFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._refreshStoreGroupsRequest$
                        ),
                        catchError(err => this._sendErrorToState$(err, 'refreshStoreGroupsFailure'))
                    );
                }
            })
        )
    );

    refreshStoreGroupsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(StoreGroupActions.refreshStoreGroupsFailure),
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
        private _$storeSegmentApi: StoreSegmentApiService,
        private _$storeGroupApi: StoreGroupApiService,
        private _$storeGroupCrudApi: StoreGroupCrudApiService
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

    _createStoreGroupRequest$ = ([userData, payload]: [User, PayloadStoreGroup]): Observable<
        AnyAction
    > => {
        const newPayload = new PayloadStoreGroup({ ...payload });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload.supplierId = supplierId;
        }

        return this._$storeGroupCrudApi.create<PayloadStoreGroup>(newPayload).pipe(
            map(resp => {
                return StoreGroupActions.createStoreGroupSuccess();
            }),
            catchError(err => this._sendErrorToState$(err, 'createStoreTypeFailure'))
        );
    };

    _fetchStoreGroupsRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$storeGroupApi.findAll<StoreSegment<StoreGroup>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map(v => new StoreGroup(v))
                            : []) || [],
                    deepestLevel: resp.deepestLevel
                };

                return StoreGroupActions.fetchStoreGroupsSuccess({
                    payload: new StoreSegment(newResp.deepestLevel, newResp.data)
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'fetchStoreTypesFailure'))
        );
    };

    _fetchStoreLastGroupRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        newParams['type'] = 'group';

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

                return StoreGroupActions.fetchStoreLastGroupSuccess({
                    payload: newResp
                });
            }),
            catchError(err => this._sendErrorToState$(err, 'fetchStoreLastGroupFailure'))
        );
    };

    _refreshStoreGroupsRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$storeGroupApi.findAll<StoreSegment<StoreGroup>>(newParams).pipe(
            catchOffline(),
            map(resp => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map(v => new StoreGroup(v))
                            : []) || [],
                    deepestLevel: resp.deepestLevel
                };

                return StoreGroupActions.refreshStoreGroupsSuccess({
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
                StoreGroupActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                StoreGroupActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                    }
                })
            );
        }

        return of(
            StoreGroupActions[dispatchTo]({
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
