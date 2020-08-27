import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { StorePortfolio } from '../models';

/**
 *
 *
 * @export
 * @class StorePortfolioApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StorePortfolioApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StorePortfolioApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StorePortfolioApiService
     */
    private readonly _endpoint = '/store-portfolio-lists';

    /**
     * Creates an instance of StorePortfolioApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StorePortfolioApiService
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

        if (params['portfolio'] !== undefined && params['associated'] !== undefined) {
            newArg.push(
                {
                    key: 'portfolio',
                    value: params['portfolio']
                },
                {
                    key: 'associated',
                    value: params['associated']
                }
            );
        } else {
            newArg.push({
                key: 'portfolio',
                value: params['portfolio']
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    findById(id: string, supplierId?: string): Observable<StorePortfolio> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<StorePortfolio>(`${this._url}/${id}`, { params: newParams });
    }

    create<T>(body: T): Observable<StorePortfolio> {
        return this.http.post<StorePortfolio>(this._url, body);
    }
}
