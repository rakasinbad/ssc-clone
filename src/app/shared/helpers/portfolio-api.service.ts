import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class PortfolioApiService
 */
@Injectable({
    providedIn: 'root'
})
export class PortfolioApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof PortfolioApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof PortfolioApiService
     */
    private readonly _endpoint = '/portfolios';

    /**
     * Creates an instance of PortfolioApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof PortfolioApiService
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
     * @memberof PortfolioApiService
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
