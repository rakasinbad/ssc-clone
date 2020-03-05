import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class WarehouseValueApiService
 */
@Injectable({
    providedIn: 'root'
})
export class WarehouseValueApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof WarehouseValueApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof WarehouseValueApiService
     */
    private readonly _endpoint = '/warehouse-values';

    /**
     * Creates an instance of WarehouseValueApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof WarehouseValueApiService
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
     * @memberof WarehouseValueApiService
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
