import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Network } from '@ngx-pwa/offline';
import { HelperService, NavigationService, NoticeService } from 'app/shared/helpers';
import { IErrorHandler } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';
import { environment } from 'environments/environment';
import * as LogRocket from 'logrocket';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { asyncScheduler, forkJoin, of, throwError } from 'rxjs';
import {
    catchError,
    debounceTime,
    exhaustMap,
    map,
    retry,
    switchMap,
    take,
    tap,
} from 'rxjs/operators';

import { AuthService } from '../../auth.service';
import { Auth } from '../../models';
import { AuthActions } from '../actions';

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
                    return AuthActions.authAutoLoginSuccess({
                        payload: new Auth(session.user, session.token),
                    });
                }

                return AuthActions.authAutoLoginFailure();
                // return AuthActions.authLogout();
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
                map((action) => action.payload),
                tap((resp) => {
                    const { user, token } = resp;
                    let sessionId = HelperService.generateRandomString(32);

                    forkJoin({
                        user: this.storage.has('user'),
                        session: this.storage.get<string>('session', { type: 'string' }),
                    })
                        .pipe(take(1))
                        .subscribe({
                            next: ({ user: storageUser, session: storageSession }) => {
                                if (!storageUser) {
                                    this.storage.set('user', new Auth(user, token)).subscribe();
                                }

                                if (!storageSession) {
                                    this.storage.set('session', sessionId).subscribe();
                                } else {
                                    sessionId = storageSession;
                                }
                            },
                            complete: () => {
                                if (environment.logRocketId) {
                                    LogRocket.identify(sessionId, {
                                        name: `${
                                            user.fullName
                                        } (${environment.environment.toUpperCase()})`,
                                        email: user.email,
                                        environment: environment.environment,
                                        version: environment.appVersion,
                                        commitHash: environment.appHash,
                                        phoneNo: user.phoneNo,
                                        mobilePhoneNo: user.mobilePhoneNo,
                                        userSuppliers: user.userSuppliers
                                            .map(
                                                (u) =>
                                                    `[${[u.supplierId, u.supplier.name].join(':')}]`
                                            )
                                            .join(','),
                                        userData: JSON.stringify(user),
                                    });
                                }

                                // /pages/dashboard
                                // if (
                                //     !this._$auth.redirectUrl ||
                                //     this._$auth.redirectUrl === '/auth/login'
                                // ) {
                                //     this.router.navigateByUrl('/pages/account/stores', {
                                //         replaceUrl: true,
                                //     });
                                // } else {
                                //     this.router.navigateByUrl(this._$auth.redirectUrl, {
                                //         replaceUrl: true,
                                //     });
                                // }
                                // this.router.navigate(['/pages/account/stores'], {
                                //     replaceUrl: true
                                // });
                            },
                        });

                    // this.storage.has('user').subscribe(result => {
                    //     if (!result) {
                    //         this.storage.set('user', new Auth(user, token)).subscribe(() => {
                    //             // /pages/dashboard
                    //             if (!this._$auth.redirectUrl) {
                    //                 this.router.navigate(['/pages/account/stores'], {
                    //                     replaceUrl: true
                    //                 });
                    //             }
                    //         });
                    //     }
                    // });

                    // if (environment.logRocketId) {
                    //     LogRocket.identify(
                    //         `${user.email}:${environment.appVersion}:${environment.appHash}`,
                    //         {
                    //             name: `${user.fullName} (${environment.environment})`,
                    //             email: user.email,
                    //             environment: environment.environment,
                    //             version: environment.appVersion,
                    //             commitHash: environment.appHash,
                    //             phoneNo: user.phoneNo,
                    //             mobilePhoneNo: user.mobilePhoneNo,
                    //             userSuppliers: user.userSuppliers
                    //                 .map(u => `[${[u.supplierId, u.supplier.name].join(':')}]`)
                    //                 .join(','),
                    //             userData: JSON.stringify(user)
                    //         }
                    //     );
                    // }
                })
            ),
        { dispatch: false }
    );

    authAutoLoginFail$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.authAutoLoginFailure),
                tap(() => {
                    this.storage.clear().subscribe({
                        next: () => {
                            this.ngxPermissions.flushPermissions();

                            this.ngxRoles.flushRoles();
                            
                            this.router.navigate(['/auth/login'], { replaceUrl: true });
                        },
                        error: (err) => {
                            this._$notice.open('Something wrong with sessions storage', 'error', {
                                verticalPosition: 'bottom',
                                horizontalPosition: 'right',
                            });
                        },
                    });
                })
            ),
        { dispatch: false }
    );

    authLogin$ = createEffect(
        () => ({ debounce = 300, scheduler = asyncScheduler } = {}) =>
            this.actions$.pipe(
                ofType(AuthActions.authLoginRequest),
                debounceTime(debounce, scheduler),
                map((action) => action.payload),
                // concatMap(payload =>
                //     of(payload).pipe(
                //         tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                //     )
                // ),
                // withLatestFrom(this.store.pipe(select(NetworkSelectors.isNetworkConnected))),
                exhaustMap(({ username, password }) => {
                    if (this._isOnline) {
                        return this._$auth.login(username, password).pipe(
                            retry(3),
                            switchMap((resp) => {
                                const { user, token } = resp;
                                const { userSuppliers } = user;

                                if (!userSuppliers && userSuppliers.length < 1) {
                                    return throwError({
                                        error: { message: 'Need Set Supplier!' },
                                    });
                                }

                                return of(
                                    AuthActions.authLoginSuccess({
                                        payload: resp,
                                    })
                                );
                            }),
                            catchError((err) =>
                                of(
                                    AuthActions.authLoginFailure({
                                        payload: {
                                            id: 'authLoginFailure',
                                            errors: err,
                                        },
                                    })
                                )
                            )
                        );
                    }

                    return of(
                        AuthActions.authLoginFailure({
                            payload: {
                                id: 'authLoginFailure',
                                errors: 'Offline',
                            },
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
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    authLoginSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.authLoginSuccess),
                map((action) => action.payload),
                tap((resp) => {
                    const { user, token } = resp;
                    let sessionId = HelperService.generateRandomString(32);

                    this._$auth.assignRolePrivileges(new Auth(user, token));

                    forkJoin({
                        user: this.storage.has('user'),
                        session: this.storage.get<string>('session', { type: 'string' }),
                    })
                        .pipe(take(1))
                        .subscribe({
                            next: ({ user: storageUser, session: storageSession }) => {
                                if (!storageUser) {
                                    this.storage.set('user', new Auth(user, token)).subscribe();
                                }

                                if (!storageSession) {
                                    this.storage.set('session', sessionId).subscribe();
                                } else {
                                    sessionId = storageSession;
                                }
                            },
                            complete: () => {
                                if (environment.logRocketId) {
                                    LogRocket.identify(sessionId, {
                                        name: `${
                                            user.fullName
                                        } (${environment.environment.toUpperCase()})`,
                                        email: user.email,
                                        environment: environment.environment,
                                        version: environment.appVersion,
                                        commitHash: environment.appHash,
                                        phoneNo: user.phoneNo,
                                        mobilePhoneNo: user.mobilePhoneNo,
                                        userSuppliers: user.userSuppliers
                                            .map(
                                                (u) =>
                                                    `[${[u.supplierId, u.supplier.name].join(':')}]`
                                            )
                                            .join(','),
                                        userData: JSON.stringify(user),
                                    });
                                }
                                window.location.replace('/pages/account/stores');
                                // this.router.navigateByUrl('/pages', {
                                //     replaceUrl: true,
                                // });
                            },
                        });

                    // this._$navigation.initNavigation();

                    // this.storage.set('user', new Auth(user, token)).subscribe({
                    //     next: () => {
                    //         // const roles = user.roles.map(r => {
                    //         //     return {
                    //         //         [r.role]
                    //         //     }
                    //         // })
                    //         // /pages/dashboard

                    //         if (environment.logRocketId) {
                    //             LogRocket.identify(
                    //                 `${user.email}:${environment.appVersion}:${environment.appHash}`,
                    //                 {
                    //                     name: `${user.fullName} (${environment.environment})`,
                    //                     email: user.email,
                    //                     environment: environment.environment,
                    //                     version: environment.appVersion,
                    //                     commitHash: environment.appHash,
                    //                     phoneNo: user.phoneNo,
                    //                     mobilePhoneNo: user.mobilePhoneNo,
                    //                     userSuppliers: user.userSuppliers
                    //                         .map(
                    //                             u =>
                    //                                 `[${[u.supplierId, u.supplier.name].join(':')}]`
                    //                         )
                    //                         .join(','),
                    //                     userData: JSON.stringify(user)
                    //                 }
                    //             );
                    //         }

                    //         this.router.navigate(['/pages/account/stores'], {
                    //             replaceUrl: true
                    //         });
                    //     },
                    //     error: err => {
                    //         this._$notice.open('Something wrong with sessions', 'error', {
                    //             verticalPosition: 'bottom',
                    //             horizontalPosition: 'right'
                    //         });
                    //     }
                    // });
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
                            this.ngxPermissions.flushPermissions();

                            this.ngxRoles.flushRoles();
                            
                            // this.router.navigate(['/auth/login'], { replaceUrl: true });

                            this.router.navigate(['/auth/login'], { replaceUrl: true });
                        },
                        error: (err) => {
                            this._$notice.open('Something wrong with sessions storage', 'error', {
                                verticalPosition: 'bottom',
                                horizontalPosition: 'right',
                            });
                        },
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private router: Router,
        protected network: Network,
        private ngxPermissions: NgxPermissionsService,
        private ngxRoles: NgxRolesService,
        private store: Store<fromRoot.State>,
        private storage: StorageMap,
        private _$auth: AuthService,
        private _$navigation: NavigationService,
        private _$notice: NoticeService
    ) {
        // NOTE Save return url
        this.router.events.subscribe((ev) => {
            // NOTE Get path url & exclude url error
            if (ev instanceof NavigationEnd) {
                if (!ev.url.includes('errors') && !ev.url.includes('auth/login')) {
                    // LoggerService.debug('Return URL', ev.url, true);
                    this._$auth.redirectUrl = ev.url;
                }
            }
        });
    }

    private _handleErrMessage(resp: IErrorHandler): string {
        if (typeof resp.errors === 'string') {
            return resp.errors;
        } else if (resp.errors.error && resp.errors.error.message) {
            return resp.errors.error.message;
        } else {
            return resp.errors.message;
        }
    }
}
