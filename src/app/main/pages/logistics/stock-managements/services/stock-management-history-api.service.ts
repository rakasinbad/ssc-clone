import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StockManagementHistoryApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StockManagementHistoryApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StockManagementHistoryApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StockManagementHistoryApiService
     */
    private readonly _endpoint = '/warehouse-catalogue-histories';

    /**
     * Creates an instance of StockManagementHistoryApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StockManagementHistoryApiService
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
     * @memberof StockManagementHistoryApiService
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

        return this.http.get<T>(this._url, { params: newParams });
    }
}
