import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { NoticeService } from 'app/shared/helpers';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { FormActions } from 'app/shared/store/actions';
import { Observable, of } from 'rxjs';
import {
    catchError,
    finalize,
    map,
    switchMap,
    tap,
} from 'rxjs/operators';

import { PortfolioApiService } from '../../services';
import { PortfolioActions } from '../actions';
import * as fromPortfolio from '../reducers';
import { Portfolio } from '../../models';

@Injectable()
export class PortfolioEffects {
    constructor(
        private actions$: Actions,
        private portfolioApi: PortfolioApiService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [PORTFOLIO]
    // -----------------------------------------------------------------------------------------------------

    fetchPortfoliosRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.fetchPortfoliosRequest),
            map(action => action.payload),
            switchMap(payload =>
                this.portfolioApi.findPortfolio<PaginateResponse<Portfolio>>(payload).pipe(
                    catchOffline(),
                    map(response => {
                        if (!payload.paginate) {
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
                )
            )
        )
    );

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
