import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, PaginateResponse, EStatus } from 'app/shared/models';
import { FormActions, UiActions } from 'app/shared/store/actions';
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

import { SalesRep, SalesRepForm, SalesRepFormPatch, SalesRepBatchActions } from '../../models';
import { SalesRepApiService } from '../../services';
import { SalesRepActions } from '../actions';
import * as fromSalesReps from '../reducers';
import { MatDialog } from '@angular/material';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { Update } from '@ngrx/entity';
import { UpdateStr } from '@ngrx/entity/src/models';

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
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromSalesReps.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$salesRepApi: SalesRepApiService
    ) {}
}
