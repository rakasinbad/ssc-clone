import { DOCUMENT, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Auth } from './models';

/**
 *
 *
 * @export
 * @class AuthService
 */
@Injectable({
    providedIn: 'root'
})
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
        private _$helper: HelperService
    ) {
        this.redirectUrl = null;
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
            .pipe(map(item => new Auth(item.user, item.token)));
    }
}
