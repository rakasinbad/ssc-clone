import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable, of } from 'rxjs';

import { PeriodTargetPromo } from '../models';
import { fromPeriodTargetPromo } from '../store/reducers';
import { EntityPayload } from 'app/shared/models/entity-payload.model';

/**
 *
 *
 * @export
 * @class PeriodTargetPromoApiService
 */
@Injectable({
    providedIn: 'root'
})
export class PeriodTargetPromoApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof PeriodTargetPromoApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof PeriodTargetPromoApiService
     */
    private readonly _PeriodTargetPromoEndpoint = '/target-promo';

    /**
     * Creates an instance of PeriodTargetPromoApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof PeriodTargetPromoApiService
     */
    constructor(
        private http: HttpClient,
        private _$helper: HelperService,
    ) {
        this._url = this._$helper.handleApiRouter(this._PeriodTargetPromoEndpoint);
    }

    // find(params: IQueryParams): Observable<Array<PeriodTargetPromo>> {
    //     const data: Array<PeriodTargetPromo> = [
    //         new PeriodTargetPromo({
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
    //         new PeriodTargetPromo({
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
    //         new PeriodTargetPromo({
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
    //         new PeriodTargetPromo({
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
    //         new PeriodTargetPromo({
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

    find<T>(params: IQueryParams): Observable<T> {
        if (params['id']) {
            this._url = this._$helper.handleApiRouter(this._PeriodTargetPromoEndpoint);
            return this.http.get<T>(`${this._url}/${params['id']}`);
        }

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

        if (params['status']) {
            newArgs.push({ key: 'status', value: params['status'] });
        }

        this._url = this._$helper.handleApiRouter(this._PeriodTargetPromoEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    addPeriodTargetPromo<T, R>(payload: T): Observable<R> {
        this._url = this._$helper.handleApiRouter(this._PeriodTargetPromoEndpoint);
        return this.http.post<R>(this._url, payload);
    }

    updatePeriodTargetPromo<T = EntityPayload<any>, R = undefined>(payload: T): Observable<R> {
        if (!payload['id'] || !payload['data']) {
            throw new Error('ERR_PERIOD_TARGET_PROMO_REQUIRED_ENTITY_PAYLOAD');
        }

        this._url = this._$helper.handleApiRouter(this._PeriodTargetPromoEndpoint);
        return this.http.patch<R>(`${this._url}/${payload['id']}`, payload['data']);
    }

    removePeriodTargetPromo<T = string, R = undefined>(payload: T): Observable<R> {
        if (typeof payload !== 'string') {
            throw new Error('ERR_DELETE_PERIOD_TARGET_PROMO_ONLY_REQUIRED_ID');
        }

        this._url = this._$helper.handleApiRouter(this._PeriodTargetPromoEndpoint);
        return this.http.delete<R>(`${this._url}/${payload}`);
    }
}
