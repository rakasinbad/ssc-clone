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
}
