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
    private _urlCalculate: string;
    private _urlCalculateOrderView: string;

    /**
     *
     *
     * @private
     * @memberof CalculateOrderApiService
     */
    private readonly _endpoint = '/calculate-orders';
    private readonly _endpointCalculate = '/payment/v1/calculate-order-payments';
    private readonly _endpointCalculateOrderView = '/order-view/calculate-orders';

    /**
     * Creates an instance of CalculateOrderApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof CalculateOrderApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        this._urlCalculate = this._$helper.handleApiRouter(this._endpointCalculate);
        this._urlCalculateOrderView = this._$helper.handleApiRouter(this._endpointCalculateOrderView);
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

    /**
     *
     *
     * @template T
     * @param {string} type
     * @param {string} [supplierId]
     * @returns {Observable<T>}
     * @memberof CalculateOrderApiService
     */
     getCalculateOrder<T>(supplierId?: string): Observable<T> {
        const newArg =
            supplierId
                ? [
                      {
                          key: 'supplierId',
                          value: supplierId
                      },
                  ]
                : [];

        const newParams = this._$helper.handleParams(this._urlCalculate, null, ...newArg);

        return this.http.get<T>(this._urlCalculate, { params: newParams });
    }

    /**
     *
     *
     * @template T
     * @param {string} [supplierId]
     * @returns {Observable<T>}
     * @memberof CalculateOrderApiService
     */
    getCalculateOrderView<T>(supplierId?: string): Observable<T> {
        const newArg =
            supplierId
                ? [
                    {
                        key: 'supplierId',
                        value: supplierId
                    },
                ]
                : [];

        const newParams = this._$helper.handleParams(this._urlCalculateOrderView, null, ...newArg);

        return this.http.get<T>(this._urlCalculateOrderView, { params: newParams });
    }

}
