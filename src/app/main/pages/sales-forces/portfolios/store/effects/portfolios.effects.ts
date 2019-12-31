import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { map, switchMap, withLatestFrom, catchError, retry, tap } from 'rxjs/operators';

import {
    PortfolioActions,
    portfolioFailureActionNames,
} from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable, throwError } from 'rxjs';
import { PortfoliosApiService } from '../../services/portfolios-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import { Portfolio } from '../../models/portfolios.model';
import { IQueryParams, TNullable, User, ErrorHandler } from 'app/shared/models';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { TypedAction } from '@ngrx/store/src/models';
import { Store } from 'app/main/pages/attendances/models';
import { fromStore } from '../reducers';
import { Router } from '@angular/router';

type AnyAction = { payload: any; } & TypedAction<any>;

@Injectable()
export class PortfoliosEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private storeState: NgRxStore<fromStore.State>,
        private portfoliosService: PortfoliosApiService,
        private notice: NoticeService,
        private router: Router,
        private helper$: HelperService,
    ) {}

    // addSelectedStores$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(PortfolioActions.addSelectedStores),
    //         map(action => action.payload),
    //         tap(stores => this.storeState.dispatch(
    //             StoreActions.removeSelectedStores({
    //                 payload: stores.map(store => store.id)
    //             })
    //         ))
    //     )
    // , { dispatch: false });

    createPortfolioRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.createPortfolioRequest),
            map(action => action.payload),
            switchMap(payload => 
                this.portfoliosService.createPortfolio(payload).pipe(
                    catchOffline(),
                    switchMap(portfolio => of(PortfolioActions.createPortfolioSuccess({ payload: portfolio }))),
                    catchError(err => this.sendErrorToState(err, 'createPortfolioFailure'))
                )
            )
        )
    );

    createPortfolioSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.createPortfolioSuccess),
            tap(() => {
                this.notice.open('Berhasil membuat portfolio.', 'success', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });

                this.router.navigate(['/pages/sales-force/portfolio']);
            })
        )
    , { dispatch: false });

    exportPortfoliosRequest$ = createEffect(() => 
        this.actions$.pipe(
            ofType(PortfolioActions.exportPortfoliosRequest),
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            switchMap(([_, authState]: [AnyAction, TNullable<Auth>]) => {
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData: User) => of(userData.userSuppliers[0].supplierId)),
                        switchMap<string, Observable<AnyAction>>(this.processExportPortfolioRequest),
                        catchError(err => this.sendErrorToState(err, 'exportPortfoliosFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData: User) => of(userData.userSuppliers[0].supplierId)),
                        switchMap<string, Observable<AnyAction>>(this.processExportPortfolioRequest),
                        catchError(err => this.sendErrorToState(err, 'exportPortfoliosFailure'))
                    );
                }
            })
        )
    );

    exportPortfoliosSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.exportPortfoliosSuccess),
            map(action => action.payload),
            tap((url: string) => {
                return window.open(url, '_blank');
            })
        ), { dispatch: false }
    );

    fetchPortfolioRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action pengambilan portfolio massal.
            ofType(PortfolioActions.fetchPortfolioRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([portfolioId, authState]: [string, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(() => of(portfolioId)),
                        switchMap<string, Observable<AnyAction>>(this.processPortfolioRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchPortfolioFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(() => of(portfolioId)),
                        switchMap<string, Observable<AnyAction>>(this.processPortfolioRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchPortfolioFailure'))
                    );
                }
            })
        )
    );

    fetchPortfoliosRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action pengambilan portfolio massal.
            ofType(PortfolioActions.fetchPortfoliosRequest),
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
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processPortfoliosRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchPortfoliosFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processPortfoliosRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchPortfoliosFailure'))
                    );
                }
            })
        )
    );

    fetchPortfolioStoresRequest$ = createEffect(() => 
        this.actions$.pipe(
            ofType(PortfolioActions.fetchPortfolioStoresRequest),
            map(action => action.payload),
            switchMap(data => this.processPortfolioStoresRequest(data)),
            catchError(err => this.sendErrorToState(err, 'fetchPortfolioStoresFailure'))
        )
    );

    checkUserSupplier = (userData: User): User => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throwError(new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`
            }));
        }
    
        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    }

    processExportPortfolioRequest = (supplierId: string): Observable<AnyAction> => {
        return this.portfoliosService
            .exportPortfoliosRequest(supplierId)
            .pipe(
                catchOffline(),
                map(({ url }) => PortfolioActions.exportPortfoliosSuccess({ payload: url })),
                catchError(err => this.sendErrorToState(err, 'exportPortfoliosFailure'))
            );
    }

    processPortfolioRequest = (portfolioId: string): Observable<AnyAction> => {
        return this.portfoliosService
            .findPortfolio(portfolioId)
            .pipe(
                catchOffline(),
                map(response =>
                    PortfolioActions.fetchPortfolioSuccess({
                        payload: {
                            portfolio: new Portfolio(response),
                            source: 'fetch'
                        }
                    })
                ),
                catchError(err => this.sendErrorToState(err, 'fetchPortfolioFailure'))
            );
    }

    processPortfoliosRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };
    
        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        return this.portfoliosService
            .findPortfolios(newQuery)
            .pipe(
                catchOffline(),
                switchMap(response =>
                    of(PortfolioActions.fetchPortfoliosSuccess({
                        payload: {
                            portfolios: response.data.map(portfolio => new Portfolio(portfolio)),
                            total: response.total,
                            source: 'fetch',
                        }
                    }))
                ),
                catchError(err => this.sendErrorToState(err, 'fetchPortfoliosFailure'))
            );
    }

    processPortfolioStoresRequest = (queryParams: IQueryParams): Observable<AnyAction> => {
        return this.portfoliosService
            .findPortfolioStores(queryParams)
            .pipe(
                catchOffline(),
                switchMap(response =>
                    of(PortfolioActions.fetchPortfolioStoresSuccess({
                        payload: {
                            stores: response.data.map(store => new Store(store)),
                            total: response.total,
                            source: 'fetch',
                        }
                    }))
                ),
                catchError(err => this.sendErrorToState(err, 'fetchPortfolioStoresFailure'))
            );
    }

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: portfolioFailureActionNames): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(PortfolioActions[dispatchTo]({
                payload: err
            }));
        }
        
        if (err instanceof HttpErrorResponse) {
            return of(PortfolioActions[dispatchTo]({
                payload: {
                    id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                    errors: err.toString()
                }
            }));
        }

        return of(PortfolioActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                errors: err.toString()
            }
        }));
    }
}