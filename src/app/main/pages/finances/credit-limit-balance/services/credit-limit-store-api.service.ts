import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import { CreditLimitStore } from '../models';

/**
 *
 *
 * @export
 * @class CreditLimitStoreApiService
 */
@Injectable({
    providedIn: 'root'
})
export class CreditLimitStoreApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof CreditLimitStoreApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof CreditLimitStoreApiService
     */
    private readonly _endpoint = '/credit-limit-stores';

    /**
     * Creates an instance of CreditLimitStoreApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof CreditLimitStoreApiService
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
     * @memberof CreditLimitStoreApiService
     */
    findAll<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  },
                  {
                      key: 'type',
                      value: 'order'
                  }
              ]
            : [
                  {
                      key: 'type',
                      value: 'order'
                  }
              ];

        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<CreditLimitStore>}
     * @memberof CreditLimitStoreApiService
     */
    findById(id: string): Observable<CreditLimitStore> {
        return this.http.get<CreditLimitStore>(`${this._url}/${id}`);
    }
}
