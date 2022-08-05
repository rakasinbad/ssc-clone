import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, PaginateResponse, TNullable } from 'app/shared/models/global.model';
import { FormActions } from 'app/shared/store/actions';
import { Observable, of } from 'rxjs';
import {
    catchError,
    finalize,
    map,
    retry,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { PortfolioApiService } from '../../services';
import { PortfolioActions } from '../actions';
import * as fromPortfolio from '../reducers';
import { Portfolio } from '../../models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { User } from 'app/shared/models/user.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Auth } from 'app/main/pages/core/auth/models';

@Injectable()
export class PortfolioEffects {
    constructor(
        private actions$: Actions,
        private portfolioApi: PortfolioApiService,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private helper$: HelperService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [PORTFOLIO]
    // -----------------------------------------------------------------------------------------------------

    fetchPortfoliosRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.fetchPortfoliosRequest),
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

    processPortfoliosRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };

        newQuery['supplierId'] = supplierId;

        return this.portfolioApi.findPortfolio<PaginateResponse<Portfolio>>(newQuery).pipe(
            catchOffline(),
            map(response => {
                if (!queryParams.paginate) {
                    return PortfolioActions.fetchPortfoliosSuccess({
                        payload: {
                            data: (response as unknown as Array<Portfolio>).map(
                                resp =>
                                    new Portfolio({ ...resp })
                            ),
                            total: (response as unknown as Array<Portfolio>).length
                        }
                    });
                }
    
                return PortfolioActions.fetchPortfoliosSuccess({
                    payload: {
                        data: response.data.map(
                            resp =>
                                new Portfolio({ ...resp })
                        ),
                        total: response.total
                    }
                });
            }),
            catchError(err => this.sendErrorToState(err, 'fetchPortfoliosFailure'))
        );
    };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: PortfolioActions.failureActionNames
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
