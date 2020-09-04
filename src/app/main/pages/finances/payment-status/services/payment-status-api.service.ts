import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class PaymentStatusApiService
 */
@Injectable({
    providedIn: 'root'
})
export class PaymentStatusApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof PaymentStatusApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof PaymentStatusApiService
     */
    private readonly _endpoint = '/order-parcels';
    // private readonly _endpointPayment = '/payment/v1/order/order-parcels';
    private readonly _endpointPayment = '/payment/v1/order/fms';


    /**
     * Creates an instance of PaymentStatusApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof PaymentStatusApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findAll(params: IQueryParams, supplierId?: string): Observable<any> {
        const  _url = this._$helper.handleApiRouter(this._endpointPayment);
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [
              ];

        const newParams = this._$helper.handleParams(_url, params, ...newArg);

        return this.http.get(_url, { params: newParams });
    }

    patch(body: any, id: string): Observable<any> {
        return this.http.patch(`${this._url}/${id}`, body);
    }
}
