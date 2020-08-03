import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class CalculateOrderApiService
 */
@Injectable({
    providedIn: 'root'
})
export class CalculateOrderApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof CalculateOrderApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof CalculateOrderApiService
     */
    private readonly _endpoint = '/payment/v1/order/calculate-orders';

    /**
     * Creates an instance of CalculateOrderApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof CalculateOrderApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {string} type
     * @param {string} [supplierId]
     * @returns {Observable<T>}
     * @memberof CalculateOrderApiService
     */
    getStatusOrders<T>(type: string, supplierId?: string): Observable<T> {
        const newArg =
            supplierId && type
                ? [
                      {
                          key: 'supplierId',
                          value: supplierId
                      },
                      {
                          key: 'type',
                          value: type
                      }
                  ]
                : [];

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
