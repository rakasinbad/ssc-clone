import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof OrderApiService
     */
    private readonly _endpoint = '/order-parcels';
    private readonly _endpointPayment = '/payment/v1/order/parcel';

    private readonly _listEndpoint = '/payment/v1/order/oms';

    /**
     * Creates an instance of OrderApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof OrderApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findAll(params: IQueryParams, supplierId?: string): Observable<any> {
        const newParam: IQueryParams = {};
        let newParams: HttpParams = null;

        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        if (params['listEndpoint']) {
            Object.keys(params).forEach(p => {
                if (p !== 'listEndpoint') {
                    newParam[p] = params[p];
                }
            });

            this._url = this._$helper.handleApiRouter(this._listEndpoint);
            newParams = this._$helper.handleParams(this._url, newParam, ...newArg);
        } else {
            this._url = this._$helper.handleApiRouter(this._endpoint);
            newParams = this._$helper.handleParams(this._url, params, ...newArg);
        }

        return this.http.get(this._url, { params: newParams });
    }

    findById(id: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointPayment);
        return this.http.get(`${this._url}/${id}`);
    }

    patch(body: any, id: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch(`${this._url}/${id}`, body);
    }

    patchCustom<T>(body: T, id: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch(`${this._url}/${id}`, body);
    }
}
