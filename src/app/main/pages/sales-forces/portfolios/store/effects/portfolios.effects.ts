import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { map, switchMap, withLatestFrom, catchError } from 'rxjs/operators';

import { PortfolioActions } from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of } from 'rxjs';
import { PortfoliosApiService } from '../../services/portfolios-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import { Portfolio } from '../../models/portfolios.model';
import { IQueryParams } from 'app/shared/models';



@Injectable()
export class PortfoliosEffects {
    fetchPortfolioRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.fetchPortfolioRequest),
            map(action => action.payload),
            withLatestFrom(this.authStore.select(AuthSelectors.getUserSupplier)),
            switchMap(([portfolioId, { supplierId }]) => {
                /** NO SUPPLIER ID! */
                if (!supplierId) {
                    return of(PortfolioActions.fetchPortfolioFailure({
                        payload: {
                            id: 'fetchPortfolioFailure',
                            errors: 'Not authenticated'
                        }
                    }));
                }

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
                        catchError(err =>
                            of(PortfolioActions.fetchPortfolioFailure({
                                payload: {
                                    id: 'fetchPortfolioFailure',
                                    errors: err
                                }
                            }))
                        )
                    );
            })
        )
    );

    fetchPortfoliosRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.fetchPortfoliosRequest),
            map(action => action.payload),
            withLatestFrom(this.authStore.select(AuthSelectors.getUserSupplier)),
            switchMap(([queryParams, { supplierId }]) => {
                /** NO SUPPLIER ID! */
                if (!supplierId) {
                    return of(PortfolioActions.fetchPortfolioFailure({
                        payload: {
                            id: 'fetchPortfoliosFailure',
                            errors: 'Not authenticated'
                        }
                    }));
                }

                const newQuery: IQueryParams = {
                    ...queryParams
                };

                newQuery['supplierId'] = supplierId;

                return this.portfoliosService
                    .findPortfolios(newQuery)
                    .pipe(
                        catchOffline(),
                        map(response =>
                            PortfolioActions.fetchPortfoliosSuccess({
                                payload: {
                                    portfolios: response
                                        .data
                                        .map(portfolio => new Portfolio(portfolio)),
                                    total: response.total,
                                    source: 'fetch',
                                }
                            })
                        ),
                        catchError(err =>
                            of(PortfolioActions.fetchPortfolioFailure({
                                payload: {
                                    id: 'fetchPortfoliosFailure',
                                    errors: err
                                }
                            }))
                        )
                    );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private portfoliosService: PortfoliosApiService,
    ) {}
}
