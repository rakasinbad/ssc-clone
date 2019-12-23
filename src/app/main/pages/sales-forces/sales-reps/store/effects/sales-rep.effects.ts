import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, PaginateResponse } from 'app/shared/models';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { SalesRepApiService } from '../../services';
import { SalesRepActions } from '../actions';
import * as fromSalesReps from '../reducers';

@Injectable()
export class SalesRepEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [SALES REPS]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Sales Reps
     * @memberof SalesRepEffects
     */
    fetchSalesRepsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.fetchSalesRepsRequest),
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
                        SalesRepActions.fetchSalesRepsFailure({
                            payload: new ErrorHandler({
                                id: 'fetchSalesRepsFailure',
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

                return this._$salesRepApi.findAll<PaginateResponse<any>>(params, supplierId).pipe(
                    catchOffline(),
                    map(resp => {
                        const newResp = {
                            data: resp.data || [],
                            total: resp.total
                        };

                        return SalesRepActions.fetchSalesRepsSuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            SalesRepActions.fetchSalesRepsFailure({
                                payload: new ErrorHandler({
                                    id: 'fetchSalesRepsFailure',
                                    errors: err
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
        private store: Store<fromSalesReps.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$salesRepApi: SalesRepApiService
    ) {}
}
