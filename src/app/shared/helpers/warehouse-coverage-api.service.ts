import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models';
import { HelperService } from './helper.service';

@Injectable({
    providedIn: 'root'
})
export class WarehouseCoverageApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof WarehouseCoverageApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof WarehouseCoverageApiService
     */
    private readonly _endpoint = '/warehouse-urbans';

    /**
     * Creates an instance of WarehouseCoverageApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof WarehouseCoverageApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @param {string} [supplierId]
     * @returns {Observable<T>}
     * @memberof WarehouseCoverageApiService
     */
    findAll<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        if (params['keyword']) {
            newArg.push({
                key: 'keyword',
                value: params['keyword']
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @param {string} [warehouseId]
     * @returns {Observable<T>}
     * @memberof WarehouseCoverageApiService
     */
    findByWarehouseId<T>(params: IQueryParams, warehouseId?: string): Observable<T> {
        const newArg = warehouseId
            ? [
                  {
                      key: 'warehouseId',
                      value: warehouseId
                  }
              ]
            : [];

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
