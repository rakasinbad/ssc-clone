import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class ExportLogApiService
 */
@Injectable({
    providedIn: 'root'
})
export class ExportLogApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof ExportLogApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof ExportLogApiService
     */
    private readonly _endpoint = '/export-logs';

    /**
     * Creates an instance of ExportLogApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof ExportLogApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @param {string} type
     * @returns {Observable<T>}
     * @memberof ExportLogApiService
     */
    findAll<T>(params: IQueryParams, type: string): Observable<T> {
        const newArg = type
            ? [
                  {
                      key: 'type',
                      value: type
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
