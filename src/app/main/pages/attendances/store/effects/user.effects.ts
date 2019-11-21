import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { LogService } from 'app/shared/helpers';
import { NetworkActions } from 'app/shared/store/actions';
import { NetworkSelectors } from 'app/shared/store/selectors';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { IPaginatedResponse, IQueryParams } from 'app/shared/models';

import { User } from '../../models';
import { UserApiService } from '../../services';
import { UserActions } from '../actions';
import { fromUser } from '../reducers';

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
                        const newResponse = new User(
                            user.id,
                            user.fullName,
                            user.email,
                            user.phoneNo,
                            user.mobilePhoneNo,
                            user.idNo,
                            user.taxNo,
                            user.status,
                            user.imageUrl,
                            user.taxImageUrl,
                            user.idImageUrl,
                            user.selfieImageUrl,
                            user.urbanId,
                            user.roles,
                            user.createdAt,
                            user.updatedAt,
                            user.deletedAt,
                        );

                        newResponse.setUserStores = user.userStores;

                        this.logSvc.generateGroup(
                            '[FETCH RESPONSE USER REQUEST] ONLINE',
                            {
                                payload: {
                                    type: 'log',
                                    value: newResponse
                                }
                            }
                        );

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
