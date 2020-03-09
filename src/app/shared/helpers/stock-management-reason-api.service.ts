import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class StockManagementReasonApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StockManagementReasonApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StockManagementReasonApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StockManagementReasonApiService
     */
    private readonly _endpoint = '/warehouse-catalogue-reasons';

    /**
     * Creates an instance of StockManagementReasonApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StockManagementReasonApiService
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
     * @memberof StockManagementReasonApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['method']) {
            newArg.push({
                key: 'method',
                value: params['method']
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
