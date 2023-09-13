import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StockManagementCatalogueApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StockManagementCatalogueApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StockManagementCatalogueApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StockManagementCatalogueApiService
     */
    private readonly _endpoint = '/warehouse-catalogues';

    /**
     * Creates an instance of StockManagementCatalogueApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StockManagementCatalogueApiService
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
     * @memberof StockManagementCatalogueApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

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

        return this.http.get<T>(this._url, { params: newParams, headers: {
            "X-Replica": "true",
        } });
    }
}
