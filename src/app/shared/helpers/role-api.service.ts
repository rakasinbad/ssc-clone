import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class RoleApiService
 */
@Injectable({
    providedIn: 'root'
})
export class RoleApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof RoleApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof RoleApiService
     */
    private readonly _endpoint = '/roles?id[$ne]=6';

    /**
     * Creates an instance of RoleApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof RoleApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @returns {Observable<T>}
     * @memberof RoleApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<T>(this._url, {
            params: newParams
        });
    }
}
