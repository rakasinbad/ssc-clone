import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { LogService } from 'app/shared/helpers';
import { NetworkActions } from 'app/shared/store/actions';
import { NetworkSelectors } from 'app/shared/store/selectors';
import * as fromRoot from 'app/store/app.reducer';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Account } from '../../models/account.model';
import { AccountApiService } from '../../services/account-api.service';
import { AccountActions } from '../actions';

@Injectable()
export class AccountEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    createAccountRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AccountActions.createAccountRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            switchMap(([body, isOnline]) => {
                if (isOnline) {
                    this._$log.generateGroup('[CREATE ACCOUNT REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: isOnline
                        },
                        payload: {
                            type: 'log',
                            value: body
                        }
                    });

                    return this._$accountApi.create(body).pipe(
                        map(resp => {
                            this._$log.generateGroup('[CREATE RESPONSE ACCOUNT]', {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            return AccountActions.createAccountSuccess({ payload: resp });
                        }),
                        catchError(err =>
                            of(
                                AccountActions.createAccountFailure({
                                    payload: {
                                        id: 'createAccountFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                }

                this._$log.generateGroup('[CREATE ACCOUNT REQUEST] OFFLINE', {
                    online: {
                        type: 'log',
                        value: isOnline
                    },
                    payload: {
                        type: 'log',
                        value: body
                    }
                });

                return of(
                    AccountActions.createAccountFailure({
                        payload: {
                            id: 'createAccountFailure',
                            errors: 'Offline'
                        }
                    })
                );
            })
        )
    );

    deleteAccountRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AccountActions.deleteAccountRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            switchMap(([id, isOnline]) => {
                if (isOnline) {
                    this._$log.generateGroup('[DELETE ACCOUNT REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: isOnline
                        },
                        payload: {
                            type: 'log',
                            value: id
                        }
                    });

                    return this._$accountApi.delete(id).pipe(
                        map(resp => {
                            this._$log.generateGroup('[DELETE RESPONSE ACCOUNT]', {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            return AccountActions.deleteAccountSuccess({ payload: id });
                        }),
                        catchError(err =>
                            of(
                                AccountActions.deleteAccountFailure({
                                    payload: {
                                        id: 'deleteAccountFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                }

                this._$log.generateGroup('[DELETE ACCOUNT REQUEST] OFFLINE', {
                    online: {
                        type: 'log',
                        value: isOnline
                    },
                    payload: {
                        type: 'log',
                        value: id
                    }
                });

                return of(
                    AccountActions.deleteAccountFailure({
                        payload: {
                            id: 'deleteAccountFailure',
                            errors: 'Offline'
                        }
                    })
                );
            })
        )
    );

    deleteAccountSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AccountActions.deleteAccountSuccess),
                tap(() => this.router.navigate(['/pages/accounts']))
            ),
        { dispatch: false }
    );

    updateAccountRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AccountActions.updateAccountRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            switchMap(([payload, isOnline]) => {
                if (isOnline && payload && payload.body && payload.id) {
                    this._$log.generateGroup('[UPDATE ACCOUNT REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: isOnline
                        },
                        payload: {
                            type: 'log',
                            value: payload
                        }
                    });

                    return this._$accountApi.updatePatch(payload.body, payload.id).pipe(
                        map(resp => {
                            this._$log.generateGroup('[UPDATE RESPONSE ACCOUNT]', {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            return AccountActions.updateAccountSuccess({
                                payload: {
                                    id: payload.id,
                                    changes: {
                                        ...payload.body
                                    }
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                AccountActions.updateAccountFailure({
                                    payload: {
                                        id: 'updateAccountFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                }

                this._$log.generateGroup('[UPDATE ACCOUNT REQUEST] OFFLINE', {
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
                    AccountActions.updateAccountFailure({
                        payload: {
                            id: 'updateAccountFailure',
                            errors: 'Offline'
                        }
                    })
                );
            })
        )
    );

    updateAccountSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AccountActions.updateAccountSuccess),
                tap(() => this.router.navigate(['/pages/accounts']))
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    fetchAccountsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AccountActions.fetchAccountsRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            switchMap(([payload, isOnline]) => {
                return this._$accountApi.findAll(payload).pipe(
                    catchOffline(),
                    // map(response => {
                    //     if (response.total < 1) {
                    //         return {
                    //             total: 0,
                    //             data: []
                    //         };
                    //     }

                    //     return response;
                    // }),
                    map(response => {
                        let newResp = {
                            total: 0,
                            data: []
                        };

                        if (response.total > 0) {
                            newResp = {
                                total: response.total,
                                data: [
                                    ...response.data.map(account => {
                                        return {
                                            ...new Account(
                                                account.id,
                                                account.fullName,
                                                account.email,
                                                account.phoneNo,
                                                account.mobilePhoneNo,
                                                account.idNo,
                                                account.taxNo,
                                                account.status,
                                                account.imageUrl,
                                                account.taxImageUrl,
                                                account.idImageUrl,
                                                account.selfieImageUrl,
                                                account.urbanId,
                                                account.userStores,
                                                account.userBrands,
                                                account.roles,
                                                account.urban,
                                                account.createdAt,
                                                account.updatedAt,
                                                account.deletedAt
                                            )
                                        };
                                    })
                                ]
                            };
                        }

                        return AccountActions.fetchAccountsSuccess({
                            payload: {
                                accounts: newResp.data,
                                total: newResp.total
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            AccountActions.fetchAccountsFailure({
                                payload: {
                                    id: 'fetchAccountsFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchAccountRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AccountActions.fetchAccountRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.select(NetworkSelectors.isNetworkConnected)),
            switchMap(([id, isOnline]) => {
                if (isOnline) {
                    this._$log.generateGroup('[FETCH ACCOUNT REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: isOnline
                        },
                        payload: {
                            type: 'log',
                            value: id
                        }
                    });

                    return this._$accountApi.findById(id).pipe(
                        catchOffline(),
                        map(resp => {
                            this._$log.generateGroup('[FETCH RESPONSE ACCOUNT REQUEST] ONLINE', {
                                online: {
                                    type: 'log',
                                    value: isOnline
                                },
                                payload: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            return AccountActions.fetchAccountSuccess({
                                payload: {
                                    account: {
                                        ...new Account(
                                            resp.id,
                                            resp.fullName,
                                            resp.email,
                                            resp.phoneNo,
                                            resp.mobilePhoneNo,
                                            resp.idNo,
                                            resp.taxNo,
                                            resp.status,
                                            resp.imageUrl,
                                            resp.taxImageUrl,
                                            resp.idImageUrl,
                                            resp.selfieImageUrl,
                                            resp.urbanId,
                                            resp.userStores,
                                            resp.userBrands,
                                            resp.roles,
                                            resp.urban,
                                            resp.createdAt,
                                            resp.updatedAt,
                                            resp.deletedAt
                                        )
                                    },
                                    source: 'fetch'
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                AccountActions.fetchAccountFailure({
                                    payload: {
                                        id: 'fetchAccountFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                }

                this._$log.generateGroup('[FETCH ACCOUNT REQUEST] OFFLINE', {
                    online: {
                        type: 'log',
                        value: isOnline
                    },
                    payload: {
                        type: 'log',
                        value: id
                    }
                });

                return of(
                    AccountActions.fetchAccountSuccess({
                        payload: {
                            source: 'cache'
                        }
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<fromRoot.State>,
        protected network: Network,
        private _$accountApi: AccountApiService,
        private _$log: LogService
    ) {}
}
