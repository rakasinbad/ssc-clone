import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { InternalEmployee } from '../../models';
import { InternalApiService } from '../../services';
import { InternalActions } from '../actions';
import { fromInternal } from '../reducers';

@Injectable()
export class InternalEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    fetchInternalEmployeesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(InternalActions.fetchInternalEmployeesRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            switchMap(([payload, auth]) => {
                if (!auth.user.data.userBrands.length) {
                    return of(
                        InternalActions.fetchInternalEmployeesFailure({
                            payload: {
                                id: 'fetchInternalEmployeesFailure',
                                errors: 'Not Found!'
                            }
                        })
                    );
                }

                return this._$internalApi
                    .findAll(payload, auth.user.data.userBrands[0].brandId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            let newResp = {
                                total: 0,
                                data: []
                            };

                            if (resp.total > 0) {
                                newResp = {
                                    total: resp.total,
                                    data: [
                                        ...resp.data.map(row => {
                                            return {
                                                ...new InternalEmployee(
                                                    row.id,
                                                    row.userId,
                                                    row.brandId,
                                                    row.status,
                                                    row.user,
                                                    row.createdAt,
                                                    row.updatedAt,
                                                    row.deletedAt
                                                )
                                            };
                                        })
                                    ]
                                };
                            }

                            return InternalActions.fetchInternalEmployeesSuccess({
                                payload: { internalEmployees: newResp.data, total: newResp.total }
                            });
                        }),
                        catchError(err =>
                            of(
                                InternalActions.fetchInternalEmployeesFailure({
                                    payload: { id: 'fetchInternalEmployeesFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<fromInternal.FeatureState>,
        private _$internalApi: InternalApiService
    ) {}
}
