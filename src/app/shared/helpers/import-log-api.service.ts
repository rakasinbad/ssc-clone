import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class ImportLogApiService
 */
@Injectable({
    providedIn: 'root'
})
export class ImportLogApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof ImportLogApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof ImportLogApiService
     */
    private readonly _endpoint = '/import-logs';

    /**
     * Creates an instance of ImportLogApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof ImportLogApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @param {string} page
     * @returns {Observable<T>}
     * @memberof ImportLogApiService
     */
    findAll<T>(params: IQueryParams, page: string): Observable<T> {
        const newArg = page
            ? [
                  {
                      key: 'page',
                      value: page
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
