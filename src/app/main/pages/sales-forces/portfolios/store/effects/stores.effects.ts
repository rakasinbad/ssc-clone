import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { Auth } from 'app/main/pages/core/auth/models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService } from 'app/shared/helpers';
import { ErrorHandler, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { StoresApiService } from '../../services';
import { PortfolioActions, portfolioFailureActionNames, StoreActions } from '../actions';
import { CoreFeatureState } from '../reducers';
import { StorePortfolio } from '../../models';

type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class StoreEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private storesService: StoresApiService,
        private helper$: HelperService,
        private portfolioStore: NgRxStore<CoreFeatureState>
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

    // checkStoreAtInvoiceGroupRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(StoreActions.checkStoreAtInvoiceGroupRequest),
    //         map(action => action.payload),
    //         switchMap<{ storeId: string; invoiceGroupId: string }, Observable<AnyAction>>(payload =>
    //             this.checkStoreAtInvoiceGroup(payload.storeId, payload.invoiceGroupId)
    //         ),
    //         catchError(err => this.sendErrorToState(err, 'checkStoreAtInvoiceGroupFailure'))
    //     )
    // );

    // checkStoreAtInvoiceGroupSuccess$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(StoreActions.checkStoreAtInvoiceGroupSuccess),
    //             map(action => action.payload),
    //             tap(({ portfolioId, code, name, storeId }) => {
    //                 this.portfolioStore.dispatch(
    //                     PortfolioActions.updateStore({
    //                         payload: {
    //                             id: storeId,
    //                             changes: {
    //                                 portfolio: portfolioId ? { code, name, id: portfolioId } : null
    //                             }
    //                         }
    //                     })
    //                 );
    //             })
    //         ),
    //     { dispatch: false }
    // );

    // checkStoreAtInvoiceGroup = (storeId: string, invoiceGroupId: string): Observable<AnyAction> => {
    //     return this.storesService.checkStoreAtInvoiceGroup(storeId, invoiceGroupId).pipe(
    //         catchOffline(),
    //         switchMap(response =>
    //             of(
    //                 StoreActions.checkStoreAtInvoiceGroupSuccess({
    //                     payload: { ...response, storeId }
    //                 })
    //             )
    //         ),
    //         catchError(err => this.sendErrorToState(err, 'checkStoreAtInvoiceGroupFailure'))
    //     );
    // };

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
        const newQuery: IQueryParams = Object.assign({}, queryParams, { supplierId });

        return this.storesService.findStores(newQuery).pipe(
            catchOffline(),
            switchMap(response =>
                of(
                    StoreActions.fetchStoresSuccess({
                        payload: {
                            stores: queryParams.paginate
                                ? response.data.map(store => new StorePortfolio({ ...store, storeType: `store-${queryParams['type']}` }))
                                : ((response as unknown) as Array<StorePortfolio>).map(
                                    store => new StorePortfolio({ ...store, storeType: `store-${queryParams['type']}` })
                                ),
                            total: response.total,
                            source: 'fetch'
                        }
                    })
                )
            ),
            catchError(err => this.sendErrorToState(err, 'fetchStoresFailure'))
        );
    };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: portfolioFailureActionNames
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            if (dispatchTo === 'fetchStoresFailure') {
                return of(
                    StoreActions[dispatchTo]({
                        payload: err
                    })
                );
            } else {
                return of(
                    PortfolioActions[dispatchTo]({
                        payload: err
                    })
                );
            }
        }

        if (err instanceof HttpErrorResponse) {
            if (dispatchTo === 'fetchStoresFailure') {
                return of(
                    StoreActions[dispatchTo]({
                        payload: {
                            id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                            errors: err.toString()
                        }
                    })
                );
            } else {
                return of(
                    PortfolioActions[dispatchTo]({
                        payload: {
                            id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                            errors: err.toString()
                        }
                    })
                );
            }
        }

        if (dispatchTo === 'fetchStoresFailure') {
            return of(
                StoreActions[dispatchTo]({
                    payload: {
                        id: `ERR_UNRECOGNIZED`,
                        errors: err.toString()
                    }
                })
            );
        } else {
            return of(
                PortfolioActions[dispatchTo]({
                    payload: {
                        id: `ERR_UNRECOGNIZED`,
                        errors: err.toString()
                    }
                })
            );
        }
    };
}
