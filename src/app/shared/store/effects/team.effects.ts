import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { TeamApiService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, ITeam, PaginateResponse, Team } from 'app/shared/models';
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

import { TeamActions } from '../actions';

@Injectable()
export class TeamEffects {
    searchTeamRequest$ = createEffect(() => ({ debounce = 300, scheduler = asyncScheduler } = {}) =>
        this.actions$.pipe(
            ofType(TeamActions.searchTeamRequest),
            debounceTime(debounce, scheduler),
            map(action => action.payload),
            map(params => TeamActions.fetchTeamRequest({ payload: params }))
        )
    );

    fetchTeamRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TeamActions.fetchTeamRequest),
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
                        TeamActions.fetchTeamFailure({
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

                return this._$teamApi.findAll<PaginateResponse<ITeam>>(params, supplierId).pipe(
                    map(resp => {
                        const newResp = {
                            data:
                                resp && resp.data && resp.data.length > 0
                                    ? resp.data.map(row => new Team(row))
                                    : [],
                            total: resp.total
                        };

                        return TeamActions.fetchTeamSuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            TeamActions.fetchTeamFailure({
                                payload: new ErrorHandler({
                                    id: 'fetchSalesRepsFailure',
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
        private _$teamApi: TeamApiService
    ) {}
}
