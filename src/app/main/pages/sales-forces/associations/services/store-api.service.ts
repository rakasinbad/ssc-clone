import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { Store } from '../models';

/**
 *
 *
 * @export
 * @class StoreApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreApiService
     */
    private readonly _endpoint = '/stores';

    /**
     * Creates an instance of StoreApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findAll<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        const newArg = [];

        if (!supplierId) {
            throw new Error('STORE_PORTFOLIO_API_REQUIRES_SUPPLIER_ID');
        } else {
            newArg.push({
                key: 'supplierId',
                value: supplierId
            });
        }

        if (!params['portfolioId']) {
            throw new Error('STORE_API_REQUIRES_PORTFOLIO_ID');
        } else {
            newArg.push({
                key: 'portfolioId',
                value: params['portfolioId']
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
