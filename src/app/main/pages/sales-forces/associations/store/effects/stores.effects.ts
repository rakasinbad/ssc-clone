import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ErrorHandler, IPaginatedResponse, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Store } from 'app/shared/models/store.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, withLatestFrom } from 'rxjs/operators';

import { AssociationApiService } from '../../services';
import { associationFailureActionNames, StoreActions } from '../actions';
import { FeatureState as CoreFeatureState } from '../reducers';

// import { PortfolioStoreSelector } from '../selectors';
type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class StoresEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private associationStore: NgRxStore<CoreFeatureState>,
        private associationApi$: AssociationApiService,
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

    // confirmRemoveAllSelectedStores$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(StoreActions.confirmRemoveAllSelectedStores),
    //         exhaustMap(() => {
    //             const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(DeleteConfirmationComponent, {
    //                 data: {
    //                     id: 'clear-all-confirmed',
    //                     title: 'Clear',
    //                     message: `It will clear all selected store from the list.
    //                                 It won't affected this portfolio unless you click the save button.
    //                                 Are you sure want to proceed?`,
    //                 }, disableClose: true
    //             });

    //             return dialogRef.afterClosed();
    //         }),
    //         // Hanya diteruskan ketika menekan tombol Yes pada confirm dialog.
    //         filter(data => !!data),
    //         withLatestFrom(
    //             this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStores),
    //             this.portfolioStore.select(PortfolioStoreSelector.getAllPortfolioStores),
    //             (_, newStores, portfolioStores) => ({ newStores, portfolioStores })
    //         ),
    //         map<{ newStores: Array<Store>; portfolioStores: Array<Store> }, any>(({ newStores, portfolioStores }) => {
    //             let isCleared = false;
    //             const newStoreIds = newStores.map(newStore => newStore.id);
    //             const portfolioStoreIds = portfolioStores.map(portfolioStore => portfolioStore.id);

    //             // const mergedStores = (newStores).concat(portfolioStores);
    //             // const uniqueStores = mergedStores.filter((store, _, newMergedStore) => {
    //             //     const newMergedStoreIds = newMergedStore.map(merged => merged.id);

    //             //     if (newMergedStoreIds.includes(store.id)) {
    //             //         return false;
    //             //     } else {
    //             //         return true;
    //             //     }
    //             // });

    //             if (newStoreIds.length > 0) {
    //                 isCleared = true;
    //                 this.portfolioStore.dispatch(
    //                     PortfolioActions.removeSelectedStores({
    //                         payload: newStoreIds
    //                     })
    //                 );
    //             }

    //             if (portfolioStoreIds.length > 0) {
    //                 isCleared = true;
    //                 this.portfolioStore.dispatch(
    //                     PortfolioActions.markStoresAsRemovedFromPortfolio({
    //                         payload: portfolioStoreIds
    //                     })
    //                 );
    //             }

    //             return isCleared;
    //         }),
    //         tap((isCleared) => {
    //             // Hanya memunculkan notifikasi jika memang ada store yang terhapus.
    //             if (isCleared) {
    //                 this.notice.open('All selected stores have been cleared.', 'info', { verticalPosition: 'bottom', horizontalPosition: 'right' });
    //             }
    //         })
    //     ), { dispatch: false }
    // );

    // createPortfolioRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(PortfolioActions.createPortfolioRequest),
    //         map(action => action.payload),
    //         switchMap(payload =>
    //             this.portfoliosService.createPortfolio(payload).pipe(
    //                 catchOffline(),
    //                 switchMap(portfolio => of(PortfolioActions.createPortfolioSuccess({ payload: portfolio }))),
    //                 catchError(err => this.sendErrorToState(err, 'createPortfolioFailure')),
    //                 finalize(() => this.portfolioStore.dispatch(FormActions.resetClickSaveButton()))
    //             )
    //         )
    //     )
    // );

    // createPortfolioSuccess$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(PortfolioActions.createPortfolioSuccess),
    //         tap(() => {
    //             this.notice.open('Berhasil membuat portfolio.', 'success', {
    //                 verticalPosition: 'bottom',
    //                 horizontalPosition: 'right'
    //             });

    //             this.router.navigate(['/pages/sales-force/portfolio']);
    //         })
    //     )
    // , { dispatch: false });

    // patchPortfolioRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(PortfolioActions.patchPortfolioRequest),
    //         map(action => action.payload),
    //         switchMap(({ id, portfolio }) =>
    //             this.portfoliosService
    //                 .patchPortfolio(id, portfolio)
    //                 .pipe(
    //                     catchOffline(),
    //                     map(response => PortfolioActions.patchPortfolioSuccess({ payload: response })),
    //                     catchError(err => this.sendErrorToState(err, 'patchPortfolioFailure')),
    //                     finalize(() => this.portfolioStore.dispatch(FormActions.resetClickSaveButton()))
    //                 )
    //         )
    //     )
    // );

    // patchPortfolioSuccess$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(PortfolioActions.patchPortfolioSuccess),
    //         tap(() => {
    //             this.notice.open('Berhasil memperbarui portfolio.', 'success', {
    //                 verticalPosition: 'bottom',
    //                 horizontalPosition: 'right'
    //             });

    //             this.router.navigate(['/pages/sales-force/portfolio']);
    //         })
    //     )
    // , { dispatch: false });

    // exportPortfoliosRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(PortfolioActions.exportPortfoliosRequest),
    //         withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
    //         switchMap(([_, authState]: [AnyAction, TNullable<Auth>]) => {
    //             if (!authState) {
    //                 return this.helper$.decodeUserToken().pipe(
    //                     map(this.checkUserSupplier),
    //                     retry(3),
    //                     switchMap((userData: User) => of(userData.userSuppliers[0].supplierId)),
    //                     switchMap<string, Observable<AnyAction>>(this.processExportPortfolioRequest),
    //                     catchError(err => this.sendErrorToState(err, 'exportPortfoliosFailure')),
    //                     finalize(() => this.portfolioStore.dispatch(FormActions.resetClickSaveButton()))
    //                 );
    //             } else {
    //                 return of(authState.user).pipe(
    //                     map(this.checkUserSupplier),
    //                     retry(3),
    //                     switchMap((userData: User) => of(userData.userSuppliers[0].supplierId)),
    //                     switchMap<string, Observable<AnyAction>>(this.processExportPortfolioRequest),
    //                     catchError(err => this.sendErrorToState(err, 'exportPortfoliosFailure')),
    //                     finalize(() => this.portfolioStore.dispatch(FormActions.resetClickSaveButton()))
    //                 );
    //             }
    //         })
    //     )
    // );

    // exportPortfoliosSuccess$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(PortfolioActions.exportPortfoliosSuccess),
    //         map(action => action.payload),
    //         tap((url: string) => {
    //             return window.open(url, '_blank');
    //         })
    //     ), { dispatch: false }
    // );

    // fetchStoreRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         // Hanya untuk action pengambilan portfolio massal.
    //         ofType(StoreActions.fetchStoreRequest),
    //         // Hanya mengambil payload-nya saja dari action.
    //         map(action => action.payload),
    //         // Mengambil data dari store-nya auth.
    //         withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
    //         // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
    //         switchMap(([portfolioId, authState]: [string, TNullable<Auth>]) => {
    //             // Jika tidak ada data supplier-nya user dari state.
    //             if (!authState) {
    //                 return this.helper$.decodeUserToken().pipe(
    //                     map(this.checkUserSupplier),
    //                     retry(3),
    //                     switchMap(() => of(portfolioId)),
    //                     switchMap<string, Observable<AnyAction>>(this.processPortfolioRequest),
    //                     catchError(err => this.sendErrorToState(err, 'fetchStoreFailure'))
    //                 );
    //             } else {
    //                 return of(authState.user).pipe(
    //                     map(this.checkUserSupplier),
    //                     retry(3),
    //                     switchMap(() => of(portfolioId)),
    //                     switchMap<string, Observable<AnyAction>>(this.processPortfolioRequest),
    //                     catchError(err => this.sendErrorToState(err, 'fetchStoreFailure'))
    //                 );
    //             }
    //         })
    //     )
    // );

    fetchStoressRequest$ = createEffect(() =>
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

    // processStoreRequest = (storeId: string): Observable<AnyAction> => {
    //     return this.associationApi$
    //         .findStore<Store>(storeId)
    //         .pipe(
    //             catchOffline(),
    //             map(response =>
    //                 PortfolioActions.fetchPortfolioSuccess({
    //                     payload: {
    //                         portfolio: new Portfolio(response),
    //                         source: 'fetch'
    //                     }
    //                 })
    //             ),
    //             catchError(err => this.sendErrorToState(err, 'fetchStoreFailure'))
    //         );
    // }

    processStoresRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<
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

        return this.associationApi$.findStore<IPaginatedResponse<Store>>(newQuery).pipe(
            catchOffline(),
            switchMap(response => {
                if (newQuery.paginate) {
                    return of(
                        StoreActions.fetchStoresSuccess({
                            payload: {
                                stores: response.data.map(store => new Store(store)),
                                total: response.total,
                                source: 'fetch'
                            }
                        })
                    );
                } else {
                    const newResponse = (response as unknown) as Array<Store>;

                    return of(
                        StoreActions.fetchStoresSuccess({
                            payload: {
                                stores: newResponse.map(store => new Store(store)),
                                total: newResponse.length,
                                source: 'fetch'
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
        dispatchTo: associationFailureActionNames
    ): Observable<AnyAction> => {
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
