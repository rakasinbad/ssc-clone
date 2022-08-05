import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Update } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import { NoticeService } from 'app/shared/helpers';
import { EStatus } from 'app/shared/models/global.model';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { SalesRep, SalesRepBatchActions } from '../../models';
import { SalesRepApiService } from '../../services';
import { SalesRepActions } from '../actions';
import * as fromSalesReps from '../reducers';

@Injectable()
export class SalesRepBatchEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [BATCH SET ACTIVE - SALES REPS]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     *
     * @memberof SalesRepBatchEffects
     */
    batchSetActiveSalesRepsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.batchSetActiveSalesRepsRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$salesRepApi
                    .create<{ id: Array<string>; status: SalesRepBatchActions }>({
                        id: payload.ids,
                        status: payload.status
                    })
                    .pipe(
                        map(resp => {
                            const salesRepsUpdate: Array<Update<SalesRep>> = payload.ids.map(r => {
                                return {
                                    id: r,
                                    changes: {
                                        status: EStatus.ACTIVE
                                    }
                                };
                            });

                            return SalesRepActions.batchSetActiveSalesRepsSuccess({
                                payload: salesRepsUpdate
                            });
                        }),
                        catchError(err =>
                            of(
                                SalesRepActions.batchSetActiveSalesRepsFailure({
                                    payload: {
                                        id: 'batchSetActiveSalesRepsFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    /**
     *
     *
     * @memberof SalesRepBatchEffects
     */
    batchSetActiveSalesRepsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.batchSetActiveSalesRepsFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Failed to set active sales reps', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     *
     * @memberof SalesRepBatchEffects
     */
    batchSetActiveSalesRepsSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.batchSetActiveSalesRepsSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Successfully set active sales reps', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [BATCH SET INACTIVE - SALES REPS]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     *
     * @memberof SalesRepBatchEffects
     */
    batchSetInactiveSalesRepsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.batchSetInactiveSalesRepsRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$salesRepApi
                    .create<{ id: Array<string>; status: SalesRepBatchActions.INACTIVE }>({
                        id: payload.ids,
                        status: payload.status
                    })
                    .pipe(
                        map(resp => {
                            const salesRepsUpdate: Array<Update<SalesRep>> = payload.ids.map(r => {
                                return {
                                    id: r,
                                    changes: {
                                        status: EStatus.INACTIVE
                                    }
                                };
                            });
                            return SalesRepActions.batchSetInactiveSalesRepsSuccess({
                                payload: salesRepsUpdate
                            });
                        }),
                        catchError(err =>
                            of(
                                SalesRepActions.batchSetInactiveSalesRepsFailure({
                                    payload: {
                                        id: 'batchSetInactiveSalesRepsFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    /**
     *
     *
     * @memberof SalesRepBatchEffects
     */
    batchSetInactiveSalesRepsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.batchSetInactiveSalesRepsFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Failed to set inactive sales reps', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     *
     * @memberof SalesRepBatchEffects
     */
    batchSetInactiveSalesRepsSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.batchSetInactiveSalesRepsSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Successfully set inactive sales reps', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [BATCH DELETE - SALES REPS]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     *
     * @memberof SalesRepBatchEffects
     */
    batchDeleteSalesRepsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SalesRepActions.batchDeleteSalesRepsRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$salesRepApi
                    .create<{ id: Array<string>; status: SalesRepBatchActions.DELETE }>({
                        id: payload.ids,
                        status: payload.status
                    })
                    .pipe(
                        map(resp => {
                            return SalesRepActions.batchDeleteSalesRepsSuccess({
                                payload: payload.ids
                            });
                        }),
                        catchError(err =>
                            of(
                                SalesRepActions.batchDeleteSalesRepsFailure({
                                    payload: {
                                        id: 'batchDeleteSalesRepsFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    /**
     *
     *
     * @memberof SalesRepBatchEffects
     */
    batchDeleteSalesRepsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.batchDeleteSalesRepsFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Failed to delete sales reps', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    /**
     *
     *
     * @memberof SalesRepBatchEffects
     */
    batchDeleteSalesRepsSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SalesRepActions.batchDeleteSalesRepsSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Successfully deleted sales reps', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private store: Store<fromSalesReps.FeatureState>,
        private _$notice: NoticeService,
        private _$salesRepApi: SalesRepApiService
    ) {}
}
