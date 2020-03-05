import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class WarehouseApiService
 */
@Injectable({
    providedIn: 'root'
})
export class WarehouseApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof WarehouseApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof WarehouseApiService
     */
    private readonly _endpoint = '/warehouses';

    /**
     * Creates an instance of WarehouseApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof WarehouseApiService
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
     * @memberof WarehouseApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (params['keyword']) {
            newArg.push({
                key: 'keyword',
                value: params['keyword']
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
