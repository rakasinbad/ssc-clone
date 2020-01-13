import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { map, switchMap, withLatestFrom, catchError, retry, tap, exhaustMap, filter } from 'rxjs/operators';

import {
    AssociatedPortfolioActions,
    associationFailureActionNames,
} from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable, throwError } from 'rxjs';
// import { PortfoliosApiService } from '../../services/portfolios-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import { Portfolio } from '../../../portfolios/models';
import { IQueryParams, TNullable, User, ErrorHandler, IPaginatedResponse } from 'app/shared/models';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { TypedAction } from '@ngrx/store/src/models';
import { Store } from 'app/main/pages/attendances/models';
import { FeatureState as AssociationCoreFeatureState } from '../reducers';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { AssociatedPortfolioSelectors } from '../selectors';
import { PortfoliosApiService } from '../../../portfolios/services';
import { AssociationApiService } from '../../services';
import { AssociatedPortfolioApiService } from '../../services/portfolio-api.service';

type AnyAction = { payload: any; } & TypedAction<any>;

@Injectable()
export class AssociatedPortfoliosEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private associationStore: NgRxStore<AssociationCoreFeatureState>,
        private associatedPortfolioService: AssociatedPortfolioApiService,
        private notice: NoticeService,
        private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog,
    ) {}

    confirmRemoveAllSelectedStores$ = createEffect(() => 
        this.actions$.pipe(
            ofType(AssociatedPortfolioActions.confirmToClearAssociatedPortfolios),
            exhaustMap(() => {
                const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(DeleteConfirmationComponent, {
                    data: {
                        id: 'clear-all-confirmed',
                        title: 'Clear',
                        message: `It will clear all selected portfolios from the list.
                                    It won't affected this portfolio unless you click the save button.
                                    Are you sure want to proceed?`,
                    }, disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            // Hanya diteruskan ketika menekan tombol Yes pada confirm dialog.
            filter(data => !!data),
            tap(() => {
                // Menghapus seluruh portfolio.
                this.associationStore.dispatch(AssociatedPortfolioActions.clearAssociatedPortfolios());
                
                // Hanya memunculkan notifikasi jika memang ada store yang terhapus.
                this.notice.open('All selected portfolios have been cleared.', 'info', { verticalPosition: 'bottom', horizontalPosition: 'right' });
            })
        ), { dispatch: false }
    );

    fetchAssociatedPortfoliosRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action pengambilan portfolio massal.
            ofType(AssociatedPortfolioActions.fetchAssociatedPortfoliosRequest),
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
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processAssociatedPortfoliosRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchAssociatedPortfoliosFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processAssociatedPortfoliosRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchAssociatedPortfoliosFailure'))
                    );
                }
            })
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

    processAssociatedPortfoliosRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };
    
        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        return this.associatedPortfolioService
            .findPortfolio<IPaginatedResponse<Portfolio>>(newQuery)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    if (newQuery.paginate) {
                        return of(AssociatedPortfolioActions.fetchAssociatedPortfoliosSuccess({
                            payload: {
                                data: response.data.map(portfolio => new Portfolio({
                                    ... portfolio,
                                    source: newQuery['fromSalesRep'] ? 'list' : 'fetch',
                                    storeQty: portfolio.storeQty || portfolio['storeAmount'],
                                    stores: Array.isArray(portfolio['storePortfolios'])
                                            ? portfolio['storePortfolios'].map(storePortfolio => new Store(storePortfolio.store))
                                            : portfolio['storePortfolios']
                                })),
                                total: response.total,
                            }
                        }));
                    } else {
                        const newResponse = (response as unknown as Array<Portfolio>);

                        return of(AssociatedPortfolioActions.fetchAssociatedPortfoliosSuccess({
                            payload: {
                                data: newResponse.map(portfolio => new Portfolio({
                                    ... portfolio,
                                    source: newQuery['fromSalesRep'] ? 'list' : 'fetch',
                                    storeQty: portfolio.storeQty || portfolio['storeAmount'],
                                    stores: Array.isArray(portfolio['storePortfolios'])
                                            ? portfolio['storePortfolios'].map(storePortfolio => new Store(storePortfolio.store))
                                            : portfolio['storePortfolios']
                                })),
                                total: newResponse.length,
                            }
                        }));
                    }
                }),
                catchError(err => this.sendErrorToState(err, 'fetchAssociatedPortfoliosFailure'))
            );
    }

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: associationFailureActionNames): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(AssociatedPortfolioActions[dispatchTo]({
                payload: err
            }));
        }
        
        if (err instanceof HttpErrorResponse) {
            return of(AssociatedPortfolioActions[dispatchTo]({
                payload: {
                    id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                    errors: err.toString()
                }
            }));
        }

        return of(AssociatedPortfolioActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                errors: err.toString()
            }
        }));
    }
}
