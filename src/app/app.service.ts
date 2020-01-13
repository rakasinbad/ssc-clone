import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable, of } from 'rxjs';
import { delay, map, retryWhen, switchMap, take, tap } from 'rxjs/operators';

import { AuthService } from './main/pages/core/auth/auth.service';
import { Auth } from './main/pages/core/auth/models';
import { NoticeService } from './shared/helpers';

@Injectable()
export class AppService {
    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private storage: StorageMap,
        private _$auth: AuthService,
        private _$notice: NoticeService
    ) {}

    initApp(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // if (isPlatformBrowser(this.platformId)) {
            //     this.store.dispatch(AuthActions.authAutoLogin());
            // }

            this.storage.has('user').subscribe({
                next: hasUser => {
                    if (hasUser) {
                        this.storage
                            .get('user')
                            .pipe(
                                tap((userSessions: Auth) => {
                                    if (!userSessions) {
                                        const err = new Error('Session does not exists!');
                                        err.name = 'SESSION_NOT_EXISTS';
                                    }
                                }),
                                retryWhen((error: Observable<Error>) => {
                                    return error.pipe(
                                        switchMap(err => {
                                            if (err.name === 'SESSION_NOT_EXISTS') {
                                                return of(err);
                                            }
                                        }),
                                        delay(1000),
                                        take(5)
                                    );
                                }),
                                map((userSessions: Auth) => {
                                    return userSessions
                                        ? new Auth(userSessions.user, userSessions.token)
                                        : null;
                                })
                            )
                            .subscribe({
                                next: data => {
                                    if (data && data.user.roles && data.user.roles.length > 0) {
                                        this._$auth.assignRolePrivileges(data);
                                    }

                                    resolve();
                                },
                                error: err => {
                                    this._$notice.open(
                                        'Something wrong with sessions storage',
                                        'error',
                                        {
                                            verticalPosition: 'bottom',
                                            horizontalPosition: 'right'
                                        }
                                    );

                                    resolve();
                                }
                            });
                    } else {
                        setTimeout(() => {
                            resolve();
                        }, 3000);
                    }
                },
                error: err => {
                    this._$notice.open('Something wrong with sessions storage', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }
            });
        });
    }
}

const initPrivileges = (appService: AppService) => {
    return () => appService.initApp();
};

export { initPrivileges };
