import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { IQueryParamsVoucher, IQueryParamsVoucherStore } from 'app/shared/models/query.model';
import { Observable, of } from 'rxjs';

import { SupplierVoucher } from '../models';
import { fromVoucher } from '../store/reducers';
import { EntityPayload } from 'app/shared/models/entity-payload.model';
import { SupplierVoucherPayload } from '../models/voucher.model';

/**
 *
 *
 * @export
 * @class VoucherApiService
 */
@Injectable({
    providedIn: 'root',
})
export class VoucherApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof VoucherApiService
     */
    private _url: string;
    private _storeUrl: string;

    /**
     *
     *
     * @private
     * @memberof VoucherApiService
     */
    private readonly _VoucherEndpoint = '/voucher';
    private readonly _VoucherStoreEndpoint = '/voucher-store-list';

    /**
     * Creates an instance of VoucherApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof VoucherApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._VoucherEndpoint);
        this._storeUrl = this._$helper.handleApiRouter(this._VoucherStoreEndpoint);
    }

    // find(params: IQueryParams): Observable<Array<Voucher>> {
    //     const data: Array<Voucher> = [
    //         new Voucher({
    //             id: '1',
    //             promoSellerId: 'D0001',
    //             promoName: 'Text',
    //             base: 'SKU',
    //             startDate: new Date().toISOString(),
    //             endDate: new Date().toISOString(),
    //             status: 'active',
    //             createdAt: new Date().toISOString(),
    //             updatedAt: new Date().toISOString(),
    //             deletedAt: null
    //         }),
    //         new Voucher({
    //             id: '2',
    //             promoSellerId: 'D0002',
    //             promoName: 'Text',
    //             base: 'SKU',
    //             startDate: new Date().toISOString(),
    //             endDate: new Date().toISOString(),
    //             status: 'inactive',
    //             createdAt: new Date().toISOString(),
    //             updatedAt: new Date().toISOString(),
    //             deletedAt: null
    //         }),
    //         new Voucher({
    //             id: '3',
    //             promoSellerId: 'D0003',
    //             promoName: 'Text',
    //             base: 'Brand',
    //             startDate: new Date().toISOString(),
    //             endDate: new Date().toISOString(),
    //             status: 'active',
    //             createdAt: new Date().toISOString(),
    //             updatedAt: new Date().toISOString(),
    //             deletedAt: null
    //         }),
    //         new Voucher({
    //             id: '4',
    //             promoSellerId: 'D0004',
    //             promoName: 'Text',
    //             base: 'Brand',
    //             startDate: new Date().toISOString(),
    //             endDate: new Date().toISOString(),
    //             status: 'active',
    //             createdAt: new Date().toISOString(),
    //             updatedAt: new Date().toISOString(),
    //             deletedAt: null
    //         }),
    //         new Voucher({
    //             id: '5',
    //             promoSellerId: 'D0005',
    //             promoName: 'Text',
    //             base: 'Faktur',
    //             startDate: new Date().toISOString(),
    //             endDate: new Date().toISOString(),
    //             status: 'active',
    //             createdAt: new Date().toISOString(),
    //             updatedAt: new Date().toISOString(),
    //             deletedAt: null
    //         }),
    //     ];

    //     return of(data);
    // }

    find<T>(params: IQueryParamsVoucher): Observable<T> {
        if (params['id']) {
            this._url = this._$helper.handleApiRouter(this._VoucherEndpoint);
            return this.http.get<T>(`${this._url}/${params['id']}`);
        }

        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_PERIOD_TARGET_PROMO_REQUIRED_SUPPLIERID');
        }

        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['totalOrderValue']) {
            newArgs.push({ key: 'totalOrderValue', value: params['totalOrderValue'] });
        }

        if (params['collected']) {
            newArgs.push({ key: 'collected', value: params['collected'] });
        }

        if (params['used']) {
            newArgs.push({ key: 'used', value: params['used'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        if (params['status']) {
            newArgs.push({ key: 'status', value: params['status'] });
        }

        this._url = this._$helper.handleApiRouter(this._VoucherEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    findStore<T>(params: IQueryParamsVoucherStore): Observable<T> {
        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_PERIOD_TARGET_PROMO_REQUIRED_SUPPLIERID');
        }

        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        this._storeUrl = this._$helper.handleApiRouter(this._VoucherStoreEndpoint);
        const newParams = this._$helper.handleParams(this._storeUrl, params, ...newArgs);

        return this.http.get<T>(`${this._storeUrl}/${params['id']}`, { params: newParams });
    }

    addVoucher<T, R>(payload: T): Observable<R> {
        this._url = this._$helper.handleApiRouter(this._VoucherEndpoint);
        return this.http.post<R>(this._url, payload);
    }

    updateVoucher<T = EntityPayload<SupplierVoucherPayload>, R = undefined>(payload: T): Observable<R> {
        if (!payload['id'] || !payload['data']) {
            throw new Error('ERR_PERIOD_TARGET_PROMO_REQUIRED_ENTITY_PAYLOAD');
        }

        this._url = this._$helper.handleApiRouter(this._VoucherEndpoint);

        if (payload['data']['status']) {
            return this.http.put<R>(`${this._url}/${payload['id']}`, payload['data']);
        } else {
            return this.http.patch<R>(`${this._url}/${payload['id']}`, payload['data']);
        }
    }

    removeVoucher<T = string, R = undefined>(payload: T): Observable<R> {
        if (typeof payload !== 'string') {
            throw new Error('ERR_DELETE_PERIOD_TARGET_PROMO_ONLY_REQUIRED_ID');
        }

        this._url = this._$helper.handleApiRouter(this._VoucherEndpoint);
        return this.http.delete<R>(`${this._url}/${payload}`);
    }
}
