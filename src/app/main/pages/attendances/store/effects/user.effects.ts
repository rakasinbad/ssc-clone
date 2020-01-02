import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { LogService } from 'app/shared/helpers';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { User } from '../../models';
import { UserApiService } from '../../services';
import { UserActions } from '../actions';

@Injectable()
export class UserEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    fetchUserRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.fetchUserRequest),
            map(action => action.payload),
            switchMap(queryParams => {
                return this.userApiSvc.findById(queryParams).pipe(
                    catchOffline(),
                    map(user => {
                        const newResponse = new User(user);

                        this.logSvc.generateGroup('[FETCH RESPONSE USER REQUEST] ONLINE', {
                            payload: {
                                type: 'log',
                                value: newResponse
                            }
                        });

                        return UserActions.fetchUserSuccess({
                            payload: {
                                user: newResponse,
                                source: 'fetch'
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            UserActions.fetchUserFailure({
                                payload: {
                                    id: 'fetchUserFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private userApiSvc: UserApiService,
        private logSvc: LogService
    ) {}
}
