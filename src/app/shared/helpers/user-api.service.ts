import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '../models';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class UserApiService
 */
@Injectable({
    providedIn: 'root'
})
export class UserApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof UserApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof UserApiService
     */
    private readonly _endpoint = '/users';

    /**
     * Creates an instance of UserApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof UserApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<User>}
     * @memberof UserApiService
     */
    findById(id: string): Observable<User> {
        return this.http.get<User>(`${this._url}/${id}`);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @returns {Observable<User>}
     * @memberof UserApiService
     */
    create<T>(body: T): Observable<User> {
        return this.http.post<User>(this._url, body);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @param {string} id
     * @returns {Observable<User>}
     * @memberof UserApiService
     */
    patchCustom<T>(body: T, id: string): Observable<User> {
        return this.http.patch<User>(`${this._url}/${id}`, body);
    }
}
