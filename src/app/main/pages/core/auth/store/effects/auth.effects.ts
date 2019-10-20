import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { LogService, NoticeService } from 'app/shared/helpers';
import { NetworkActions } from 'app/shared/store/actions';
import { NetworkSelectors } from 'app/shared/store/selectors';
import { asyncScheduler, of } from 'rxjs';
import {
    catchError,
    concatMap,
    debounceTime,
    exhaustMap,
    map,
    switchMap,
    tap,
    withLatestFrom,
    mergeMap,
    retry
} from 'rxjs/operators';

import { AuthService } from '../../auth.service';
import { Auth } from '../../models';
import { AuthActions } from '../actions';
// import { fromAuth } from '../reducers';
import * as fromRoot from 'app/store/app.reducer';
import { Network } from '@ngx-pwa/offline';

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
            switchMap((user: any) => {
                if (user) {
                    return of(
                        AuthActions.authAutoLoginSuccess({
                            payload: {
                                ...new Auth(user.data, user.token)
                            }
                        })
                    );
                }

                return of(AuthActions.authLogout());
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

    authAutoLoginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.authAutoLoginSuccess),
                map(action => action.payload),
                tap(resp => {
                    const { data, token } = resp;

                    console.log('AUTO LOGIN SUCCESS', this._$auth.redirectUrl, resp);

                    if (!this._$auth.redirectUrl) {
                        this.storage.has('user').subscribe(result => {
                            if (!result) {
                                this.storage.set('user', new Auth(data, token)).subscribe(() => {
                                    this.router.navigate(['/pages/dashboard'], {
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
                exhaustMap(payload => {
                    if (this._isOnline) {
                        this._$log.generateGroup('[LOGIN REQUEST] ONLINE', {
                            online: {
                                type: 'log',
                                value: this._isOnline
                            },
                            payload: {
                                type: 'log',
                                value: payload
                            }
                        });

                        return this._$auth.login(payload.username, payload.password).pipe(
                            retry(3),
                            map(resp => {
                                const { user, token } = resp;

                                return AuthActions.authLoginSuccess({
                                    payload: {
                                        ...new Auth(user, token)
                                    }
                                });
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
                        payload: {
                            type: 'log',
                            value: payload
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
                    this._$notice.open(resp.errors.error.message, 'error', {
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
                    const { data, token } = resp;

                    console.log('LOGIN SUCCESS', this._$auth.redirectUrl, resp);

                    this.storage.set('user', new Auth(data, token)).subscribe(() => {
                        this.router.navigate(['/pages/dashboard'], {
                            replaceUrl: true
                        });
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
                    this.storage.clear().subscribe(() => {
                        this.router.navigate(['/auth/login'], { replaceUrl: true });
                    });
                })
            ),
        {
            dispatch: false
        }
    );

    constructor(
        private actions$: Actions,
        private route: ActivatedRoute,
        private router: Router,
        protected network: Network,
        private store: Store<fromRoot.State>,
        private storage: StorageMap,
        private _$auth: AuthService,
        private _$log: LogService,
        private _$notice: NoticeService
    ) {}
}
