import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { Account } from 'app/main/pages/accounts/models';
import { AccountApiService } from 'app/main/pages/accounts/services';
import { RoleApiService } from 'app/main/pages/roles/role-api.service';
import { Role } from 'app/main/pages/roles/role.model';
import { LogService } from 'app/shared/helpers';
import * as fromRoot from 'app/store/app.reducer';
import { of } from 'rxjs';
import { catchError, concatMap, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { DropdownActions, NetworkActions } from '../actions';
import { NetworkSelectors } from '../selectors';

@Injectable()
export class DropdownEffects {
    private _isOnline = this.network.online;

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH dropdown methods
    // -----------------------------------------------------------------------------------------------------

    fetchRoleDropdownRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownRoleRequest),
            // concatMap(payload =>
            //     of(payload).pipe(
            //         tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
            //     )
            // ),
            // withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            switchMap(_ => {
                if (this._isOnline) {
                    this._$log.generateGroup('[FETCH DROPDOWN ROLE REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: this._isOnline
                        }
                    });
                }

                return this._$roleApi.findAll({ paginate: false }).pipe(
                    catchOffline(),
                    retry(3),
                    map(resp => (!resp['data'] ? (resp as Role[]) : null)),
                    map(resp => {
                        this._$log.generateGroup('[FETCH RESPONSE DROPDOWN ROLE] ONLINE', {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return DropdownActions.fetchDropdownRoleSuccess({ payload: resp });
                    }),
                    catchError(err =>
                        of(
                            DropdownActions.fetchDropdownRoleFailure({
                                payload: {
                                    id: 'fetchDropdownRoleFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchRoleDropdownByTypeRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchDropdownRoleByTypeRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$roleApi
                    .findByRoleType(payload, {
                        paginate: false
                    })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            this._$log.generateGroup(
                                '[FETCH RESPONSE DROPDOWN ROLE BY TYPE] ONLINE',
                                {
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                }
                            );

                            return DropdownActions.fetchDropdownRoleSuccess({ payload: resp });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchDropdownRoleFailure({
                                    payload: {
                                        id: 'fetchDropdownRoleByTypeFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH search methods
    // -----------------------------------------------------------------------------------------------------

    fetchAccountSearchRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(DropdownActions.fetchSearchAccountRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            switchMap(([payload, isOnline]) => {
                if (isOnline) {
                    this._$log.generateGroup('[FETCH SEARCH ACCOUNT REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: isOnline
                        },
                        payload: {
                            type: 'log',
                            value: payload
                        }
                    });

                    return this._$accountApi.searchBy(payload).pipe(
                        catchOffline(),
                        map(resp => {
                            this._$log.generateGroup('[FETCH RESPONSE SEARCH ACCOUNT] ONLINE', {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            const newResp =
                                resp && resp.length > 0
                                    ? [
                                          ...resp.map(account => {
                                              return {
                                                  ...new Account(
                                                      account.id,
                                                      account.fullName,
                                                      account.email,
                                                      account.phoneNo,
                                                      account.mobilePhoneNo,
                                                      account.status,
                                                      account.imageUrl,
                                                      account.urbanId,
                                                      account.userOdooId,
                                                      account.userStores,
                                                      account.roles,
                                                      account.attendances,
                                                      account.urban,
                                                      account.createdAt,
                                                      account.updatedAt,
                                                      account.deletedAt
                                                  )
                                              };
                                          })
                                      ]
                                    : [];

                            return DropdownActions.fetchSearchAccountSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                DropdownActions.fetchSearchAccountFailure({
                                    payload: {
                                        id: 'fetchAccountSearchFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                }

                this._$log.generateGroup('[FETCH SEARCH ACCOUNT REQUEST] OFFLINE', {
                    online: {
                        type: 'log',
                        value: isOnline
                    },
                    payload: {
                        type: 'log',
                        value: payload
                    }
                });

                return of(
                    DropdownActions.fetchSearchAccountFailure({
                        payload: {
                            id: 'fetchAccountSearchFailure',
                            errors: 'Offline'
                        }
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private store: Store<fromRoot.State>,
        protected network: Network,
        private _$accountApi: AccountApiService,
        private _$log: LogService,
        private _$roleApi: RoleApiService
    ) {}
}
