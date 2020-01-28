import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { PortfolioApiService } from 'app/shared/helpers';
import {
    ErrorHandler,
    IPortfolio,
    IQueryParams,
    PaginateResponse,
    Portfolio
} from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';
import { asyncScheduler, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    exhaustMap,
    map,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import { PortfolioActions } from '../actions';

@Injectable()
export class PortfolioEffects {
    searchPortfolioRequest$ = createEffect(
        () => ({ debounce = 300, scheduler = asyncScheduler } = {}) =>
            this.actions$.pipe(
                ofType(PortfolioActions.searchPortfolioRequest),
                debounceTime(debounce, scheduler),
                map(action => action.payload),
                map(params => PortfolioActions.fetchPortfolioRequest({ payload: params }))
            )
    );

    fetchPortfolioRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.fetchPortfolioRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then(user => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;

                return of([params, supplierId]);
            }),
            switchMap(([params, data]: [IQueryParams, string | Auth]) => {
                if (!data) {
                    return of(
                        PortfolioActions.fetchPortfolioFailure({
                            payload: new ErrorHandler({
                                id: 'fetchPortfolioFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                let supplierId;

                if (typeof data === 'string') {
                    supplierId = data;
                } else {
                    supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                }

                return this._$portfolioApi
                    .findAll<PaginateResponse<IPortfolio>>(params, supplierId)
                    .pipe(
                        map(resp => {
                            const newResp = {
                                data:
                                    resp && resp.data && resp.data.length > 0
                                        ? resp.data.map(row => new Portfolio(row))
                                        : [],
                                total: resp.total
                            };

                            return PortfolioActions.fetchPortfolioSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                PortfolioActions.fetchPortfolioFailure({
                                    payload: new ErrorHandler({
                                        id: 'fetchPortfolioFailure',
                                        errors: 'Not Found!'
                                    })
                                })
                            )
                        )
                    );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private store: Store<fromRoot.State>,
        private storage: StorageMap,
        private _$portfolioApi: PortfolioApiService
    ) {}
}
