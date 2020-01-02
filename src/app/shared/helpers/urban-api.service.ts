import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FilterUrban, IQueryParams, PaginateResponse, Urban } from '../models';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class UrbanApiService
 */
@Injectable({
    providedIn: 'root'
})
export class UrbanApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof UrbanApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof UrbanApiService
     */
    private readonly _endpoint = '/urbans';

    /**
     *Creates an instance of UrbanApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof UrbanApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @param {FilterUrban} [filter]
     * @returns {(Observable<Array<Urban> | PaginateResponse<Urban>>)}
     * @memberof UrbanApiService
     */
    findAll(
        params: IQueryParams,
        filter?: FilterUrban
    ): Observable<Array<Urban> | PaginateResponse<Urban>> {
        const newArg = filter
            ? [
                  {
                      key: 'filter',
                      value: filter
                  }
              ]
            : [];
        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<Array<Urban> | PaginateResponse<Urban>>(this._url, {
            params: newParams
        });
    }

    findTest(params: IQueryParams): Observable<PaginateResponse<Urban>> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<PaginateResponse<Urban>>(this._url, {
            params: newParams
        });
    }
}
