import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { options } from 'numeral';
import { Observable } from 'rxjs';

export interface IAPIOptions {
    header_X_Type: string;
}

/**
 *
 *
 * @export
 * @class PaymentStatusApiService
 */
@Injectable({ providedIn: 'root' })
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
    private readonly _endpointPatch = '/order-parcels';
    // private readonly _endpointPayment = '/payment/v1/order/order-parcels';
    // private readonly _endpointPayment = '/payment/v1/order/fms';
    private readonly _endpointPayment = '/payment/v1/fms';

    /**
     * Creates an instance of PaymentStatusApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof PaymentStatusApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpointPayment);
    }

    findAll(params: IQueryParams, supplierId?: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointPayment);
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParamsV2(this._url, params, ...newArg);

        return this.http.get(this._url, { params: newParams });
    }


    findById(id: string, type = 'order'): Observable<any> {
        if (type === 'invoice'){
            this._url = this._$helper.handleApiRouter('/payment/v1/invoice');
        }else{
            this._url = this._$helper.handleApiRouter(this._endpointPayment);
        }
        return this.http.get(`${this._url}/${id}`);
    }

    patch(body: any, id: string, opts?: IAPIOptions): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointPatch);

        let headers: HttpHeaders;

        if (opts.header_X_Type) {
            headers = new HttpHeaders({
                'X-Type': opts.header_X_Type
            });
        }
        
        return this.http.patch(`${this._url}/${id}`, body, {headers});
    }
}
