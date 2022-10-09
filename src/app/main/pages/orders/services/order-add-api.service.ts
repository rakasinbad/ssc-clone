import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { CreateManualOrder, ParamPaymentVal, ProductCheckout } from '../models';

@Injectable({
    providedIn: 'root',
})
export class OrderAddApiService {
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
     * @memberof OrderAddApiService
     */
    private readonly _endpoint = '/manual-order';

    /**
     * Creates an instance of OrderAddApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof OrderAddApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    supplierStoreProductList<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        const newParam: IQueryParams = {};
        let newParams: HttpParams = null;

        const newArgs = [];

        if (params['storeId']) {
            newArgs.push({ key: 'storeId', value: params['storeId'] });
        }
        if (params['orderDate']) {
            newArgs.push({ key: 'orderDate', value: params['orderDate'] });
        }

        if (params['skip'] > 0) {
            newArgs.push({ key: 'skip', value: params.skip });
        }

        if (params['skip'] == 0) {
            newArgs.push({ key: 'skip', value: '0' });
        }

        if (params['limit']) {
            newArgs.push({ key: 'limit', value: params['limit'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        if (params['storeChannelId'] || params['storeChannelId'] == null) {
            newArgs.push({ key: 'storeChannelId', value: params['storeChannelId'] });
        }

        if (params['storeClusterId'] || params['storeClusterId'] == null) {
            newArgs.push({ key: 'storeClusterId', value: params['storeClusterId'] });
        }
        if (params['storeGroupId'] || params['storeGroupId'] == null) {
            newArgs.push({ key: 'storeGroupId', value: params['storeGroupId'] });
        }

        if (params['storeTypeId'] || params['storeTypeId'] == null) {
            newArgs.push({ key: 'storeTypeId', value: params['storeTypeId'] });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint + '/supplier-store-products');
        newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    checkoutProduct(body: CreateManualOrder): Observable<ProductCheckout> {
        this._url = this._$helper.handleApiRouter(this._endpoint + '/checkout');
        return this.http.post<ProductCheckout>(this._url, body);
    }

    paymentValidation(orderParcelId: string ): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpoint+'/v1/web/payment-list');
    
        return this.http.get(this._url, {
          params: {
            orderParcelId
          }
        })
    }

    paymentList(orderParcelId: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpoint+'/v1/web/payment-list');
    
        return this.http.get(this._url, {
          params: {
            orderParcelId
          }
        })
      }
}
