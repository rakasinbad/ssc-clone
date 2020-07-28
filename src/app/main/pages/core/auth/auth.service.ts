import { DOCUMENT, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HelperService, NavigationService } from 'app/shared/helpers';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Auth } from './models';

/**
 *
 *
 * @export
 * @class AuthService
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof AuthService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof AuthService
     */
    private readonly _endpoint = '/auth/login';

    /**
     *
     *
     * @private
     * @type {string}
     * @memberof AuthService
     */
    private _redirectUrl: string;

    constructor(
        @Inject(DOCUMENT) private doc: Document,
        private http: HttpClient,
        private loc: Location,
        private ngxPermissions: NgxPermissionsService,
        private ngxRoles: NgxRolesService,
        private _$helper: HelperService,
        private _$navigation: NavigationService
    ) {
        // this.redirectUrl = null;
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @type {string}
     * @memberof AuthService
     */
    get redirectUrl(): string {
        return this._redirectUrl;
    }

    /**
     *
     *
     * @memberof AuthService
     */
    set redirectUrl(url: string) {
        this._redirectUrl = url;
    }

    /**
     *
     *
     * @param {string} username
     * @param {string} password
     * @returns {Observable<Auth>}
     * @memberof AuthService
     */
    login(username: string, password: string): Observable<Auth> {
        return this.http
            .post<Auth>(this._url, { username, password })
            .pipe(map((item) => new Auth(item.user, item.token)));
    }

    assignRolePrivileges(data: Auth): void {
        const { roles } = data.user;

        // Restructure for assign to ngxRoles
        const newRoles = roles
            .map((role) => {
                const { privileges } = role;
                const newPrivileges =
                    privileges && privileges.length > 0
                        ? privileges.map((privilege) => {
                              return String(privilege.privilege).toUpperCase();
                          })
                        : null;

                // Assign permissions to ngx-permissions (https://www.npmjs.com/package/ngx-permissions#individual-permissions)
                this.ngxPermissions.addPermission(newPrivileges);

                return {
                    role: String(role.role).toUpperCase().replace(/\s+/g, '_'),
                    privileges: newPrivileges ? newPrivileges : [],
                };
            })
            .reduce((obj, item) => ((obj[item.role] = item.privileges), obj), {});

        // Assign roles to ngx-permissions (https://www.npmjs.com/package/ngx-permissions#multiple-roles)
        this.ngxRoles.addRoles(newRoles);

        this._$navigation.initNavigation();
    }
}
