import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { NoticeService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { JourneyPlan } from '../../models';
import { JourneyPlanApiService } from '../../services';
import { JourneyPlanActions } from '../actions';

@Injectable()
export class JourneyPlanEffects {
    fetchJourneyPlansRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(JourneyPlanActions.fetchJourneyPlansRequest),
            map(action => action.payload),
            switchMap(params => {
                return this._$journeyPlanApi.findAll<PaginateResponse<JourneyPlan>>(params).pipe(
                    catchOffline(),
                    map(resp => {
                        const newResp = {
                            data: resp.data || [],
                            total: resp.total
                        };

                        return JourneyPlanActions.fetchJourneyPlansSuccess({
                            payload: {
                                ...newResp,
                                data:
                                    newResp.data && newResp.data.length > 0
                                        ? newResp.data.map(r => new JourneyPlan(r))
                                        : []
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            JourneyPlanActions.fetchJourneyPlansFailure({
                                payload: new ErrorHandler({
                                    id: 'fetchJourneyPlansFailure',
                                    errors: err
                                })
                            })
                        )
                    )
                );
            })
        )
    );

    fetchJourneyPlansFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanActions.fetchJourneyPlansFailure),
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
        private _$notice: NoticeService,
        private _$journeyPlanApi: JourneyPlanApiService
    ) {}
}
