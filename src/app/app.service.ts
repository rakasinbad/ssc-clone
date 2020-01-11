import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { map } from 'rxjs/operators';

import { Auth } from './main/pages/core/auth/models';
import { NoticeService } from './shared/helpers';

@Injectable()
export class AppService {
    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private ngxPermissions: NgxPermissionsService,
        private ngxRoles: NgxRolesService,
        private storage: StorageMap,
        private _$notice: NoticeService
    ) {}

    initApp(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // if (isPlatformBrowser(this.platformId)) {
            //     this.store.dispatch(AuthActions.authAutoLogin());
            // }

            if (this.storage.has('user')) {
                this.storage
                    .get('user')
                    .pipe(
                        map((userSessions: Auth) => {
                            return userSessions
                                ? new Auth(userSessions.user, userSessions.token)
                                : null;
                        })
                    )
                    .subscribe({
                        next: data => {
                            if (data && data.user.roles && data.user.roles.length > 0) {
                                const { roles } = data.user;

                                // Restructure for assign to ngxRoles
                                const newRoles = roles
                                    .map(role => {
                                        const { privileges } = role;
                                        const newPrivileges =
                                            privileges && privileges.length > 0
                                                ? privileges.map(privilege => {
                                                      return String(
                                                          privilege.privilege
                                                      ).toUpperCase();
                                                  })
                                                : null;

                                        // Assign permissions to ngx-permissions (https://www.npmjs.com/package/ngx-permissions#individual-permissions)
                                        this.ngxPermissions.addPermission(newPrivileges);

                                        return {
                                            role: String(role.role)
                                                .toUpperCase()
                                                .replace(/\s+/g, '_'),
                                            privileges: newPrivileges ? newPrivileges : []
                                        };
                                    })
                                    .reduce(
                                        (obj, item) => ((obj[item.role] = item.privileges), obj),
                                        {}
                                    );

                                // Assign roles to ngx-permissions (https://www.npmjs.com/package/ngx-permissions#multiple-roles)
                                this.ngxRoles.addRoles(newRoles);
                            }

                            resolve();
                        },
                        error: err => {
                            this._$notice.open('Something wrong with sessions storage', 'error', {
                                verticalPosition: 'bottom',
                                horizontalPosition: 'right'
                            });

                            resolve();
                        }
                    });
            } else {
                setTimeout(() => {
                    resolve();
                }, 3000);
            }
        });
    }
}

const initPrivileges = (appService: AppService) => {
    return () => appService.initApp();
};

export { initPrivileges };
