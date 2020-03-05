import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class WarehouseCatalogueApiService
 */
@Injectable({
    providedIn: 'root'
})
export class WarehouseCatalogueApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof WarehouseCatalogueApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof WarehouseCatalogueApiService
     */
    private readonly _endpoint = '/warehouse-catalogues';

    /**
     * Creates an instance of WarehouseCatalogueApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof WarehouseCatalogueApiService
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
     * @memberof WarehouseCatalogueApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (params['warehouseId']) {
            newArg.push({
                key: 'warehouseId',
                value: params['warehouseId']
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
