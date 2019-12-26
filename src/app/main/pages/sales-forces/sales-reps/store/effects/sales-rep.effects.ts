import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, PaginateResponse } from 'app/shared/models';
import { FormActions } from 'app/shared/store/actions';
import { of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { SalesRep, SalesRepForm } from '../../models';
import { SalesRepApiService } from '../../services';
import { SalesRepActions } from '../actions';
import * as fromSalesReps from '../reducers';

@Injectable()
export class SalesRepEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [ADD - SALES REPS]
    // -----------------------------------------------------------------------------------------------------

    createSalesRepRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.createSalesRepRequest),
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
            switchMap(([payload, data]: [Required<SalesRepForm>, string | Auth]) => {
                if (!data) {
                    return of(
                        SalesRepActions.createSalesRepFailure({
                            payload: new ErrorHandler({
                                id: 'createSalesRepFailure',
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

                payload = {
                    ...payload,
                    supplierId
                };

                return this._$salesRepApi.create<Required<SalesRepForm>>(payload).pipe(
                    map(resp => {
                        return SalesRepActions.createSalesRepSuccess({
                            payload: new SalesRep(resp)
                        });
                    }),
                    catchError(err =>
                        of(
                            SalesRepActions.createSalesRepFailure({
                                payload: new ErrorHandler({
                                    id: 'createSalesRepFailure',
                                    errors: err
                                })
                            })
                        )
                    ),
                    finalize(() => {
                        this.store.dispatch(FormActions.resetClickSaveButton());
                    })
                );
            })
        )
    );

    createSalesRepFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.createSalesRepFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Failed to create sales rep', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    createSalesRepSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.createSalesRepSuccess),
                map(action => action.payload),
                tap(resp => {
                    this.router.navigate(['/pages/sales-force/sales-rep']).finally(() => {
                        this._$notice.open('Successfully created sales rep', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );

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

                return this._$salesRepApi
                    .findAll<PaginateResponse<SalesRep>>(params, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                data: resp.data || [],
                                total: resp.total
                            };

                            return SalesRepActions.fetchSalesRepsSuccess({
                                payload: {
                                    ...newResp,
                                    data:
                                        newResp.data && newResp.data.length > 0
                                            ? newResp.data.map(r => new SalesRep(r))
                                            : []
                                }
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

    fetchSalesRepsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.fetchSalesRepsFailure),
                map(action => action.payload),
                tap(resp => {
                    const message =
                        typeof resp.errors === 'string'
                            ? resp.errors
                            : resp.errors.error.message || resp.errors.message;

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<fromSalesReps.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$salesRepApi: SalesRepApiService
    ) {}
}
