import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
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
     * @param {string} page
     * @returns {Observable<T>}
     * @memberof ExportLogApiService
     */
    findAll<T>(params: IQueryParams, type: string, page: string, supplierId: string): Observable<T> {
        const newArg =
            type && page
                ? [
                      {
                          key: 'type',
                          value: type
                      },
                      {
                          key: 'page',
                          value: page
                      }
                  ]
                : [];
        if (page === 'payments') {
            if (supplierId) {
                newArg.push({
                    key: 'supplierId',
                    value: supplierId,
                });
            }
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    create(payload: {
        page: string;
        userId: string;
        type: string;
        status: string;
        url: string;
    }): Observable<any> {
        return this.http.post(this._url, payload);
    }
}
