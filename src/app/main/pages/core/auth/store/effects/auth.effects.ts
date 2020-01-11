import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Network } from '@ngx-pwa/offline';
import { LogService, NoticeService } from 'app/shared/helpers';
import * as fromRoot from 'app/store/app.reducer';
import { asyncScheduler, of, throwError } from 'rxjs';
import { catchError, debounceTime, exhaustMap, map, retry, switchMap, tap } from 'rxjs/operators';

import { AuthService } from '../../auth.service';
import { Auth } from '../../models';
import { AuthActions } from '../actions';

// import { fromAuth } from '../reducers';
@Injectable()
export class AuthEffects {
    private _isOnline = this.network.online;

    authAutoLogin$ = createEffect(() => ({ debounce = 300, scheduler = asyncScheduler } = {}) =>
        this.actions$.pipe(
            ofType(AuthActions.authAutoLogin),
            debounceTime(debounce, scheduler),
            // concatMap(payload =>
            //     of(payload).pipe(
            //         tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
            //     )
            // ),
            // withLatestFrom(this.store.pipe(select(NetworkSelectors.isNetworkConnected))),
            // map(action => action[1]),
            exhaustMap(() => {
                return this.storage.get('user').toPromise();
                // return this.storage
                //     .get('user')
                //     .toPromise()
                //     .then(user => [isOnline, user]);
            }),
            map((session: Auth) => {
                // if (typeof session === 'string') {
                //     const newSession = JSON.parse(session);

                //     if (newSession && newSession.user && newSession.token) {
                //         return AuthActions.authAutoLoginSuccess({
                //             payload: new Auth(newSession.user, newSession.token)
                //         });
                //     }

                //     return AuthActions.authLogout();
                // } else {
                //     if (session && session.user && session.token) {
                //         this._$log.generateGroup('[REQUEST AUTO LOGIN]', {
                //             session: {
                //                 type: 'log',
                //                 value: session
                //             },
                //             user: {
                //                 type: 'log',
                //                 value: session.user
                //             },
                //             token: {
                //                 type: 'log',
                //                 value: session.token
                //             }
                //         });

                //         return AuthActions.authAutoLoginSuccess({
                //             payload: new Auth(session.user, session.token)
                //         });
                //     }

                //     return AuthActions.authLogout();
                // }

                if (session && session.user && session.token) {
                    this._$log.generateGroup('[REQUEST AUTO LOGIN]', {
                        session: {
                            type: 'log',
                            value: session
                        },
                        user: {
                            type: 'log',
                            value: session.user
                        },
                        token: {
                            type: 'log',
                            value: session.token
                        }
                    });

                    return AuthActions.authAutoLoginSuccess({
                        payload: new Auth(session.user, session.token)
                    });
                }

                return AuthActions.authLogout();
            })
            // switchMap(([isOnline, user]: [boolean, any]) => {
            //     if (isOnline && user) {
            //         return of(
            //             AuthActions.authLoginSuccess({
            //                 payload: {
            //                     ...new Auth(user.data, user.token)
            //                 }
            //             })
            //         );
            //     }

            //     return [
            //         AuthActions.authLoginFailure({
            //             payload: {
            //                 id: 'authAutoLoginFailure',
            //                 errors: 'Offline'
            //             }
            //         }),
            //         AuthActions.authLogout()
            //     ];
            // })
        )
    );

    // authAutoLogin$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(AuthActions.authAutoLogin),
    //         exhaustMap(() => {
    //             return this.storage.get('user').toPromise();
    //         }),
    //         map((session: Auth) => {
    //             if (session && session.user && session.token) {
    //                 this._$log.generateGroup('[REQUEST AUTO LOGIN]', {
    //                     session: {
    //                         type: 'log',
    //                         value: session
    //                     },
    //                     user: {
    //                         type: 'log',
    //                         value: session.user
    //                     },
    //                     token: {
    //                         type: 'log',
    //                         value: session.token
    //                     }
    //                 });

    //                 return AuthActions.authAutoLoginSuccess({
    //                     payload: new Auth(session.user, session.token)
    //                 });
    //             }

    //             return AuthActions.authLogout();
    //         })
    //     )
    // );

    authAutoLoginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.authAutoLoginSuccess),
                map(action => action.payload),
                tap(resp => {
                    const { user, token } = resp;

                    this._$log.generateGroup('[AUTO LOGIN SUCCESS]', {
                        resp: {
                            type: 'log',
                            value: resp
                        },
                        redirectUrl: {
                            type: 'log',
                            value: this._$auth.redirectUrl
                        }
                    });

                    if (!this._$auth.redirectUrl) {
                        this.storage.has('user').subscribe(result => {
                            if (!result) {
                                this.storage.set('user', new Auth(user, token)).subscribe(() => {
                                    // /pages/dashboard
                                    this.router.navigate(['/pages/account/stores'], {
                                        replaceUrl: true
                                    });
                                });
                            }
                        });
                    }
                })
            ),
        { dispatch: false }
    );

    authLogin$ = createEffect(
        () => ({ debounce = 300, scheduler = asyncScheduler } = {}) =>
            this.actions$.pipe(
                ofType(AuthActions.authLoginRequest),
                debounceTime(debounce, scheduler),
                map(action => action.payload),
                // concatMap(payload =>
                //     of(payload).pipe(
                //         tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                //     )
                // ),
                // withLatestFrom(this.store.pipe(select(NetworkSelectors.isNetworkConnected))),
                exhaustMap(({ username, password }) => {
                    if (this._isOnline) {
                        this._$log.generateGroup('[LOGIN REQUEST] ONLINE', {
                            online: {
                                type: 'log',
                                value: this._isOnline
                            },
                            username: {
                                type: 'log',
                                value: username
                            },
                            password: {
                                type: 'log',
                                value: password
                            }
                        });

                        return this._$auth.login(username, password).pipe(
                            retry(3),
                            switchMap(resp => {
                                const { user, token } = resp;
                                const { userSuppliers } = user;

                                this._$log.generateGroup('[RESPONSE REQUEST LOGIN]', {
                                    resp: {
                                        type: 'log',
                                        value: resp
                                    },
                                    user: {
                                        type: 'log',
                                        value: user
                                    },
                                    token: {
                                        type: 'log',
                                        value: token
                                    }
                                });

                                if (!userSuppliers && userSuppliers.length < 1) {
                                    return throwError({
                                        error: { message: 'Need Set Supplier!' }
                                    });
                                }

                                return of(
                                    AuthActions.authLoginSuccess({
                                        payload: resp
                                    })
                                );
                            }),
                            catchError(err =>
                                of(
                                    AuthActions.authLoginFailure({
                                        payload: {
                                            id: 'authLoginFailure',
                                            errors: err
                                        }
                                    })
                                )
                            )
                        );
                    }

                    this._$log.generateGroup('[LOGIN REQUEST] OFFLINE', {
                        online: {
                            type: 'log',
                            value: this._isOnline
                        },
                        username: {
                            type: 'log',
                            value: username
                        },
                        password: {
                            type: 'log',
                            value: password
                        }
                    });

                    return of(
                        AuthActions.authLoginFailure({
                            payload: {
                                id: 'authLoginFailure',
                                errors: 'Offline'
                            }
                        })
                    );

                    // else {
                    //     if (this.storage.has('token')) {
                    //         this._$log.generateGroup('[LOGIN REQUEST] OFFLINE TOKEN', {
                    //             online: {
                    //                 type: 'log',
                    //                 value: isOnline
                    //             },
                    //             payload: {
                    //                 type: 'log',
                    //                 value: payload
                    //             }
                    //         });

                    //         // Login
                    //         return this.storage
                    //             .get<string>('token', { type: 'string' })
                    //             .toPromise()
                    //             .then(token => {
                    //                 console.log('TOKEN', token);

                    //                 return [payload, isOnline, token];
                    //             });
                    //         // return of([payload, isOnline]).pipe(
                    //         //     map(x => [
                    //         //         x[0],
                    //         //         x[1],
                    //         //         from(
                    //         //             this.storage
                    //         //                 .get<string>('token', { type: 'string' })
                    //         //                 .toPromise()
                    //         //         )
                    //         //     ])
                    //         // );
                    //     }

                    //     this._$log.generateGroup('[LOGIN REQUEST] OFFLINE', {
                    //         online: {
                    //             type: 'log',
                    //             value: isOnline
                    //         },
                    //         payload: {
                    //             type: 'log',
                    //             value: payload
                    //         }
                    //     });

                    //     // Logout
                    //     // return of([payload, isOnline, AuthActions.authLogout()]);
                    // }
                })
                // catchError(err =>
                //     of(
                //         AuthActions.authLoginFailure({
                //             payload: {
                //                 id: 'authLoginFailure',
                //                 errors: err
                //             }
                //         })
                //     )
                // )
            ),
        { resubscribeOnError: false }
    );

    authLoginFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.authLoginFailure),
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

    authLoginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.authLoginSuccess),
                map(action => action.payload),
                tap(resp => {
                    const { user, token } = resp;

                    this.storage.set('user', new Auth(user, token)).subscribe({
                        next: () => {
                            // const roles = user.roles.map(r => {
                            //     return {
                            //         [r.role]
                            //     }
                            // })
                            // /pages/dashboard
                            this.router.navigate(['/pages/account/stores'], {
                                replaceUrl: true
                            });
                        },
                        error: err => {
                            this._$notice.open('Something wrong with sessions', 'error', {
                                verticalPosition: 'bottom',
                                horizontalPosition: 'right'
                            });
                        }
                    });
                })
            ),
        { dispatch: false }
    );

    authLogout$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.authLogout),
                tap(() => {
                    this.storage.clear().subscribe({
                        next: () => {
                            this.router.navigate(['/auth/login'], { replaceUrl: true });
                        },
                        error: err => {
                            this._$notice.open('Something wrong with sessions storage', 'error', {
                                verticalPosition: 'bottom',
                                horizontalPosition: 'right'
                            });
                        }
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private router: Router,
        protected network: Network,
        private store: Store<fromRoot.State>,
        private storage: StorageMap,
        private _$auth: AuthService,
        private _$log: LogService,
        private _$notice: NoticeService
    ) {}
}
