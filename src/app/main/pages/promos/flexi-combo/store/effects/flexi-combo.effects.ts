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
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { CreateFlexiComboDto, FlexiCombo } from '../../models';
import { FlexiComboApiService } from '../../services/flexi-combo-api.service';
import { FlexiComboActions, FlexiComboFailureActions } from '../actions';
import * as fromFlexiCombos from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);
@Injectable()
export class FlexiComboEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - FLEXI COMBO]
    // -----------------------------------------------------------------------------------------------------

    createFlexiComboRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.createFlexiComboRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [CreateFlexiComboDto, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'createFlexiComboFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, CreateFlexiComboDto], Observable<AnyAction>>(
                            this._createFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'createFlexiComboFailure'))
                    );
                }
            })
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [FLEXI COMBOS]
    // -----------------------------------------------------------------------------------------------------

    fetchFlexiCombosRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.fetchFlexiCombosRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchFlexiCombosRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchFlexiCombosFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchFlexiCombosRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchFlexiCombosFailure'))
                    );
                }
            })
        )
    );

    fetchFlexiCombosFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.fetchFlexiCombosFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [FLEXI COMBO]
    // -----------------------------------------------------------------------------------------------------

    fetchFlexiComboRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.fetchFlexiComboRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([id, authState]: [string, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, id])),
                        switchMap<[User, string], Observable<AnyAction>>(
                            this._fetchFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, id])),
                        switchMap<[User, string], Observable<AnyAction>>(
                            this._fetchFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
                    );
                }
            })
        )
    );

    fetchFlexiComboFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.fetchFlexiComboFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this.router.navigateByUrl('/pages/promos/flexi-combo').finally(() => {
                        this._$notice.open(message, 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$flexiComboApi: FlexiComboApiService
    ) {}

    _checkUserSupplier = (userData: User): User => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throw new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`,
            });
        }

        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    };

    _createFlexiComboRequest$ = ([userData, payload]: [User, CreateFlexiComboDto]): Observable<
        AnyAction
    > => {
        const newPayload = new CreateFlexiComboDto({ ...payload });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload.supplierId = supplierId;
        }

        console.log('[REQ] Create 1', payload);
        console.log('[REQ] Create 2', newPayload);

        return of({ type: 'SUCCESS' });

        // return this._$storeTypeCrudApi.create<PayloadStoreType>(newPayload).pipe(
        //     map((resp) => {
        //         return StoreTypeActions.createStoreTypeSuccess();
        //     }),
        //     catchError((err) => this._sendErrorToState$(err, 'createStoreTypeFailure'))
        // );
    };

    _fetchFlexiCombosRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params,
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$flexiComboApi.findAll<PaginateResponse<FlexiCombo>>(newParams).pipe(
            catchOffline(),
            map((resp) => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map((v) => new FlexiCombo(v))
                            : []) || [],
                    total: resp.total,
                };

                return FlexiComboActions.fetchFlexiCombosSuccess({
                    payload: newResp,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'fetchFlexiCombosFailure'))
        );
    };

    _fetchFlexiComboRequest$ = ([userData, flexiComboId]: [User, string]): Observable<
        AnyAction
    > => {
        const newParams: IQueryParams = {
            paginate: false,
        };

        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$flexiComboApi.findById<FlexiCombo>(flexiComboId, newParams).pipe(
            catchOffline(),
            map((resp) =>
                FlexiComboActions.fetchFlexiComboSuccess({
                    payload: new FlexiCombo(resp),
                })
            ),
            catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
        );
    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: FlexiComboFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                FlexiComboActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                FlexiComboActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            FlexiComboActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
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
