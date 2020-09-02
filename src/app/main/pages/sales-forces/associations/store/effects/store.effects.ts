import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService } from 'app/shared/helpers';
import { ErrorHandler, IPaginatedResponse, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { AnyAction } from 'app/shared/models/actions.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, withLatestFrom } from 'rxjs/operators';

import { StoreApiService } from '../../services';
import { StoreActions } from '../actions';
import { Store } from '../../models';

@Injectable()
export class StoreEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private storeApiService: StoreApiService,
        private helper$: HelperService,
    ) {}

    fetchStoresRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action pengambilan portfolio massal.
            ofType(StoreActions.fetchStoresRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [IQueryParams, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.processStoresRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchStoresFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.processStoresRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchStoresFailure'))
                    );
                }
            })
        )
    );

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

    processStoresRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };

        return this.storeApiService.findAll<IPaginatedResponse<Store>>(newQuery, supplierId).pipe(
            catchOffline(),
            switchMap(response => {
                if (newQuery.paginate) {
                    return of(
                        StoreActions.fetchStoresSuccess({
                            payload: {
                                data: response.data.map(store => new Store(store)),
                                total: response.total,
                            }
                        })
                    );
                } else {
                    const newResponse = (response as unknown) as Array<Store>;

                    return of(
                        StoreActions.fetchStoresSuccess({
                            payload: {
                                data: newResponse.map(store => new Store(store)),
                                total: newResponse.length,
                            }
                        })
                    );
                }
            }),
            catchError(err => this.sendErrorToState(err, 'fetchStoresFailure'))
        );
    };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: StoreActions.failureActionNames
    ): Observable<AnyAction> => {
        HelperService.debug('ERROR', err);
        this.helper$.showErrorNotification(new ErrorHandler(err as ErrorHandler));

        if (err instanceof ErrorHandler) {
            return of(
                StoreActions[dispatchTo]({
                    payload: err
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                StoreActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: err
                    }
                })
            );
        }

        return of(
            StoreActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err
                }
            })
        );
    };
}
