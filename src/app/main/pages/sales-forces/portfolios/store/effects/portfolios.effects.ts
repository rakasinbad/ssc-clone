import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { Auth } from 'app/main/pages/core/auth/models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { ErrorHandler, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { FormActions } from 'app/shared/store/actions';
import { Observable, of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    filter,
    finalize,
    map,
    retry,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { IPortfolioAddForm, Portfolio } from '../../models/portfolios.model';
import { PortfoliosApiService } from '../../services/portfolios-api.service';
import { PortfolioActions, portfolioFailureActionNames } from '../actions';
import { CoreFeatureState } from '../reducers';
import { PortfolioStoreSelector } from '../selectors';

type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class PortfoliosEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private portfoliosService: PortfoliosApiService,
        private notice: NoticeService,
        private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog
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

    confirmRemoveAllSelectedStores$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PortfolioActions.confirmRemoveAllSelectedStores),
                exhaustMap(() => {
                    const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(
                        DeleteConfirmationComponent,
                        {
                            data: {
                                id: 'clear-all-confirmed',
                                title: 'Clear',
                                message: `It will clear all selected store from the list.
                                    It won't affected this portfolio unless you click the save button.
                                    Are you sure want to proceed?`
                            },
                            disableClose: true
                        }
                    );

                    return dialogRef.afterClosed();
                }),
                // Hanya diteruskan ketika menekan tombol Yes pada confirm dialog.
                filter(data => !!data),
                withLatestFrom(
                    this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStores),
                    this.portfolioStore.select(PortfolioStoreSelector.getAllPortfolioStores),
                    (_, newStores, portfolioStores) => ({ newStores, portfolioStores })
                ),
                map<{ newStores: Array<Store>; portfolioStores: Array<Store> }, any>(
                    ({ newStores, portfolioStores }) => {
                        let isCleared = false;
                        const newStoreIds = newStores.map(newStore => newStore.id);
                        const portfolioStoreIds = portfolioStores.map(
                            portfolioStore => portfolioStore.id
                        );

                        // const mergedStores = (newStores).concat(portfolioStores);
                        // const uniqueStores = mergedStores.filter((store, _, newMergedStore) => {
                        //     const newMergedStoreIds = newMergedStore.map(merged => merged.id);

                        //     if (newMergedStoreIds.includes(store.id)) {
                        //         return false;
                        //     } else {
                        //         return true;
                        //     }
                        // });

                        if (newStoreIds.length > 0) {
                            isCleared = true;
                            this.portfolioStore.dispatch(
                                PortfolioActions.removeSelectedStores({
                                    payload: newStoreIds
                                })
                            );
                        }

                        if (portfolioStoreIds.length > 0) {
                            isCleared = true;
                            this.portfolioStore.dispatch(
                                PortfolioActions.markStoresAsRemovedFromPortfolio({
                                    payload: portfolioStoreIds
                                })
                            );
                        }

                        return isCleared;
                    }
                ),
                tap(isCleared => {
                    // Hanya memunculkan notifikasi jika memang ada store yang terhapus.
                    if (isCleared) {
                        this.notice.open('All selected stores have been cleared.', 'info', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    }
                })
            ),
        { dispatch: false }
    );

    createPortfolioRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.createPortfolioRequest),
            map(action => action.payload),
            switchMap(payload =>
                this.portfoliosService.createPortfolio(payload).pipe(
                    catchOffline(),
                    switchMap(portfolio =>
                        of(PortfolioActions.createPortfolioSuccess({ payload: portfolio }))
                    ),
                    catchError(err => this.sendErrorToState(err, 'createPortfolioFailure')),
                    finalize(() => this.portfolioStore.dispatch(FormActions.resetClickSaveButton()))
                )
            )
        )
    );

    createPortfolioSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PortfolioActions.createPortfolioSuccess),
                tap(() => {
                    this.notice.open('Berhasil membuat portfolio.', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    this.router.navigate(['/pages/sales-force/portfolio']);
                })
            ),
        { dispatch: false }
    );

    patchPortfolioRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.patchPortfolioRequest),
            map(action => action.payload),
            switchMap(({ id, portfolio }) =>
                this.portfoliosService.patchPortfolio(id, portfolio).pipe(
                    catchOffline(),
                    map(response => PortfolioActions.patchPortfolioSuccess({ payload: response })),
                    catchError(err => this.sendErrorToState(err, 'patchPortfolioFailure')),
                    finalize(() => this.portfolioStore.dispatch(FormActions.resetClickSaveButton()))
                )
            )
        )
    );

    patchPortfolioSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PortfolioActions.patchPortfolioSuccess),
                tap(() => {
                    this.notice.open('Berhasil memperbarui portfolio.', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    this.router.navigate(['/pages/sales-force/portfolio']);
                })
            ),
        { dispatch: false }
    );

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
                        switchMap<string, Observable<AnyAction>>(
                            this.processExportPortfolioRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'exportPortfoliosFailure')),
                        finalize(() =>
                            this.portfolioStore.dispatch(FormActions.resetClickSaveButton())
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData: User) => of(userData.userSuppliers[0].supplierId)),
                        switchMap<string, Observable<AnyAction>>(
                            this.processExportPortfolioRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'exportPortfoliosFailure')),
                        finalize(() =>
                            this.portfolioStore.dispatch(FormActions.resetClickSaveButton())
                        )
                    );
                }
            })
        )
    );

    exportPortfoliosSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PortfolioActions.exportPortfoliosSuccess),
                map(action => action.payload),
                tap((url: string) => {
                    return window.open(url, '_blank');
                })
            ),
        { dispatch: false }
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
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.processPortfoliosRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchPortfoliosFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.processPortfoliosRequest
                        ),
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
            throw new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`
            });
        }

        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    };

    processExportPortfolioRequest = (supplierId: string): Observable<AnyAction> => {
        return this.portfoliosService.exportPortfoliosRequest(supplierId).pipe(
            catchOffline(),
            map(({ url }) => PortfolioActions.exportPortfoliosSuccess({ payload: url })),
            catchError(err => this.sendErrorToState(err, 'exportPortfoliosFailure'))
        );
    };

    processPatchPortfolioRequest = (data: {
        id: string;
        portfolio: IPortfolioAddForm;
    }): Observable<AnyAction> => {
        return this.portfoliosService.patchPortfolio(data.id, data.portfolio).pipe(
            catchOffline(),
            map(portfolio => PortfolioActions.patchPortfolioSuccess({ payload: portfolio })),
            catchError(err => this.sendErrorToState(err, 'patchPortfolioFailure'))
        );
    };

    processPortfolioRequest = (portfolioId: string): Observable<AnyAction> => {
        return this.portfoliosService.findPortfolio(portfolioId).pipe(
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
    };

    processPortfoliosRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };

        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        return this.portfoliosService.findPortfolios(newQuery).pipe(
            catchOffline(),
            switchMap(response => {
                if (newQuery.paginate) {
                    try {
                        return of(
                            PortfolioActions.fetchPortfoliosSuccess({
                                payload: {
                                    portfolios: response.data.map(
                                        portfolio =>
                                            new Portfolio({
                                                ...portfolio,
                                                storeQty:
                                                    portfolio.storeQty || portfolio['storeAmount'],
                                                stores: Array.isArray(portfolio['storePortfolios'])
                                                    ? portfolio['storePortfolios'].map(
                                                          storePortfolio =>
                                                              new Store(storePortfolio.store)
                                                      )
                                                    : portfolio['storePortfolios']
                                            })
                                    ),
                                    total: response.total,
                                    source: 'fetch'
                                }
                            })
                        );
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    const newResponse = (response as unknown) as Array<Portfolio>;

                    return of(
                        PortfolioActions.fetchPortfoliosSuccess({
                            payload: {
                                portfolios: newResponse.map(
                                    portfolio =>
                                        new Portfolio({
                                            ...portfolio,
                                            storeQty:
                                                portfolio.storeQty || portfolio['storeAmount'],
                                            stores: Array.isArray(portfolio['storePortfolios'])
                                                ? portfolio['storePortfolios'].map(
                                                      storePortfolio =>
                                                          new Store(storePortfolio.store)
                                                  )
                                                : portfolio['storePortfolios']
                                        })
                                ),
                                total: newResponse.length,
                                source: 'fetch'
                            }
                        })
                    );
                }
            }),
            catchError(err => this.sendErrorToState(err, 'fetchPortfoliosFailure'))
        );
    };

    processPortfolioStoresRequest = (queryParams: IQueryParams): Observable<AnyAction> => {
        return this.portfoliosService.findPortfolioStores(queryParams).pipe(
            catchOffline(),
            switchMap(response => {
                return of(
                    PortfolioActions.fetchPortfolioStoresSuccess({
                        payload: {
                            stores: queryParams.paginate
                                ? response.data.map(store => new Store(store))
                                : ((response as unknown) as Array<Store>).map(
                                    store => new Store(store)
                                ),
                            total: queryParams.paginate
                                ? response.total
                                : ((response as unknown) as Array<Store>).length,
                            source: 'fetch'
                        }
                    })
                );
            }),
            catchError(err => this.sendErrorToState(err, 'fetchPortfolioStoresFailure'))
        );
    };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: portfolioFailureActionNames
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                PortfolioActions[dispatchTo]({
                    payload: err
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                PortfolioActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: err.toString()
                    }
                })
            );
        }

        return of(
            PortfolioActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err.toString()
                }
            })
        );
    };
}
