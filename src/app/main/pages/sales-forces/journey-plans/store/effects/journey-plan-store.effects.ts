import { DeleteConfirmationComponent } from './../../../../../../shared/modals/delete-confirmation/delete-confirmation.component';
import { sortBy } from 'lodash';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, PaginateResponse } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { StorePortfolio } from '../../models';
import { JourneyPlanStoreApiService } from '../../services';
import { JourneyPlanStoreActions, JourneyPlanStoreSelectedActions } from '../actions';
import { MatDialog } from '@angular/material';

@Injectable()
export class JourneyPlanStoreEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - SALES REP]
    // -----------------------------------------------------------------------------------------------------

    confirmClearAllSelectedStores$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanStoreSelectedActions.confirmClearAllSelectedStores),
                map(action => action.payload),
                exhaustMap(params => {
                    const dialogRef = this.matDialog.open<
                        DeleteConfirmationComponent,
                        any,
                        Array<string>
                    >(DeleteConfirmationComponent, {
                        data: {
                            title: 'Delete',
                            message: `Are you sure want to clear all selected stores ?`,
                            id: params
                        },
                        disableClose: true
                    });

                    return dialogRef.afterClosed();
                }),
                map(ids => {
                    if (ids && ids.length > 0) {
                        this.store.dispatch(JourneyPlanStoreSelectedActions.clearSelectedStores());
                    }
                })
            ),
        { dispatch: false }
    );

    fetchJourneyPlanStoresRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(JourneyPlanStoreActions.fetchJourneyPlanStoresRequest),
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
                        JourneyPlanStoreActions.fetchJourneyPlanStoresFailure({
                            payload: new ErrorHandler({
                                id: 'fetchJourneyPlanStoresFailure',
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

                return this._$journeyPlanStoreApi
                    .findAll<PaginateResponse<StorePortfolio>>(params, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                data: resp.data || [],
                                total: resp.total
                            };

                            return JourneyPlanStoreActions.fetchJourneyPlanStoresSuccess({
                                payload: {
                                    ...newResp,
                                    data:
                                        newResp.data && newResp.data.length > 0
                                            ? sortBy(
                                                  newResp.data.map(r => new StorePortfolio(r)),
                                                  ['name'],
                                                  ['asc']
                                              )
                                            : []
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                JourneyPlanStoreActions.fetchJourneyPlanStoresFailure({
                                    payload: new ErrorHandler({
                                        id: 'fetchJourneyPlanStoresFailure',
                                        errors: err
                                    })
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchJourneyPlanStoresFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanStoreActions.fetchJourneyPlanStoresFailure),
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
        private store: Store<fromRoot.State>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$journeyPlanStoreApi: JourneyPlanStoreApiService
    ) {}
}
