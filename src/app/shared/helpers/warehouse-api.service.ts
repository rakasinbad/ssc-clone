import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models';
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
     * @param {string} [supplierId]
     * @returns {Observable<T>}
     * @memberof WarehouseApiService
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

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
