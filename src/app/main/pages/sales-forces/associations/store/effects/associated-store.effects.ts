import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, exhaustMap, filter, switchMap, tap } from 'rxjs/operators';

import { AssociatedPortfolioApiService } from '../../services/portfolio-api.service';
import { AssociatedStoreActions, associationFailureActionNames } from '../actions';
import { FeatureState as AssociationCoreFeatureState } from '../reducers';

type AnyAction = { payload: any } & TypedAction<any>;

@Injectable()
export class AssociatedStoresEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private associationStore: NgRxStore<AssociationCoreFeatureState>,
        private associatedPortfolioService: AssociatedPortfolioApiService,
        private notice: NoticeService,
        private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog
    ) {}

    confirmRemoveAllSelectedStores$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AssociatedStoreActions.confirmToClearAssociatedStores),
                exhaustMap(() => {
                    const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(
                        DeleteConfirmationComponent,
                        {
                            data: {
                                id: 'clear-all-confirmed',
                                title: 'Clear',
                                message: `It will clear all selected stores from the list.
                                    It won't affected this store unless you click the save button.
                                    Are you sure want to proceed?`
                            },
                            disableClose: true
                        }
                    );

                    return dialogRef.afterClosed();
                }),
                // Hanya diteruskan ketika menekan tombol Yes pada confirm dialog.
                filter(data => !!data),
                tap(() => {
                    // Menghapus seluruh portfolio.
                    this.associationStore.dispatch(AssociatedStoreActions.clearAssociatedStores());

                    // Hanya memunculkan notifikasi jika memang ada store yang terhapus.
                    this.notice.open('All selected stores have been cleared.', 'info', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // fetchAssociatedStoresRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         // Hanya untuk action pengambilan portfolio massal.
    //         ofType(AssociatedStoreActions.fetchAssociatedStoresRequest),
    //         // Hanya mengambil payload-nya saja dari action.
    //         map(action => action.payload),
    //         // Mengambil data dari store-nya auth.
    //         withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
    //         // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
    //         switchMap(([queryParams, authState]: [IQueryParams, TNullable<Auth>]) => {
    //             // Jika tidak ada data supplier-nya user dari state.
    //             if (!authState) {
    //                 return this.helper$.decodeUserToken().pipe(
    //                     map(this.checkUserSupplier),
    //                     retry(3),
    //                     switchMap(userData => of([userData, queryParams])),
    //                     switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processAssociatedStoresRequest),
    //                     catchError(err => this.sendErrorToState(err, 'fetchAssociatedStoresFailure'))
    //                 );
    //             } else {
    //                 return of(authState.user).pipe(
    //                     map(this.checkUserSupplier),
    //                     retry(3),
    //                     switchMap(userData => of([userData, queryParams])),
    //                     switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processAssociatedStoresRequest),
    //                     catchError(err => this.sendErrorToState(err, 'fetchAssociatedStoresFailure'))
    //                 );
    //             }
    //         })
    //     )
    // );

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

    processAssociatedStoresRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;

        const newQuery = { ...queryParams };

        return this.associatedPortfolioService
            .findPortfolio<IPaginatedResponse<Store>>({
                ...queryParams,
                supplierId
            } as IQueryParams)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    if (newQuery.paginate) {
                        return of(
                            AssociatedStoreActions.fetchAssociatedStoresSuccess({
                                payload: {
                                    data: response.data.map(store => {
                                        const newStore = store;
                                        newStore.source = newQuery['fromSalesRep']
                                            ? 'list'
                                            : 'fetch';

                                        return new Store(newStore);
                                    }),
                                    total: response.total
                                }
                            })
                        );
                    } else {
                        const newResponse = (response as unknown) as Array<Store>;

                        return of(
                            AssociatedStoreActions.fetchAssociatedStoresSuccess({
                                payload: {
                                    data: newResponse.map(store => {
                                        const newStore = store;
                                        newStore.source = newQuery['fromSalesRep']
                                            ? 'list'
                                            : 'fetch';

                                        return new Store(newStore);
                                    }),
                                    total: newResponse.length
                                }
                            })
                        );
                    }
                }),
                catchError(err => this.sendErrorToState(err, 'fetchAssociatedStoresFailure'))
            );
    };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: associationFailureActionNames
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                AssociatedStoreActions[dispatchTo]({
                    payload: err
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                AssociatedStoreActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: err.toString()
                    }
                })
            );
        }

        return of(
            AssociatedStoreActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err.toString()
                }
            })
        );
    };
}
