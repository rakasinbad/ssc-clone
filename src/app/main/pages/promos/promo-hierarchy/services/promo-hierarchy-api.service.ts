import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { IQueryParamsVoucher } from 'app/shared/models/query.model';
import { Observable, of } from 'rxjs';

import { PromoHierarchy } from '../models';
import { fromPromoHierarchy } from '../store/reducers';
import { EntityPayload } from 'app/shared/models/entity-payload.model';
import { PromoHierarchyPayload } from '../models/promo-hierarchy.model';

/**
 *
 *
 * @export
 * @class PromoHierarchyApiService
 */
@Injectable({
    providedIn: 'root',
})
export class PromoHierarchyApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof PromoHierarchyApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof PromoHierarchyApiService
     */
    private readonly _PromoHierarchyEndpoint = '/promo-hierarchy';

    /**
     * Creates an instance of PromoHierarchyApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof PromoHierarchyApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._PromoHierarchyEndpoint);
    }

    find<T>(params: IQueryParamsVoucher): Observable<T> {
        console.log('isi params->', params)
        if (params['id']) {
            this._url = this._$helper.handleApiRouter(this._PromoHierarchyEndpoint);
            return this.http.get<T>(`${this._url}/${params['id']}`);
        }

        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_PERIOD_TARGET_PROMO_REQUIRED_SUPPLIERID');
        }

        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        // if (params['totalOrderValue']) {
        //     newArgs.push({ key: 'totalOrderValue', value: params['totalOrderValue'] });
        // }

        if (params['collected']) {
            newArgs.push({ key: 'collected', value: params['collected'] });
        }

        if (params['used']) {
            newArgs.push({ key: 'used', value: params['used'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        // if (params['status']) {
        //     newArgs.push({ key: 'status', value: params['status'] });
        // }

        if (params['layer'] !== null) {
            if (params['layer'] == 0) {
                newArgs.push({ key: 'layer', value: '0' });
            } else {
                newArgs.push({ key: 'layer', value: params['layer'] });
            }
        }

        if (params['type']) {
            newArgs.push({ key: 'type', value: params['type'] });
        }

       

        this._url = this._$helper.handleApiRouter(this._PromoHierarchyEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    addPromoHierarchy<T, R>(payload: T): Observable<R> {
        this._url = this._$helper.handleApiRouter(this._PromoHierarchyEndpoint);
        return this.http.post<R>(this._url, payload);
    }

    updatePromoHierarchy<T = EntityPayload<PromoHierarchyPayload>, R = undefined>(payload: T): Observable<R> {
        if (!payload['id'] || !payload['data']) {
            throw new Error('ERR_PERIOD_TARGET_PROMO_REQUIRED_ENTITY_PAYLOAD');
        }

        this._url = this._$helper.handleApiRouter(this._PromoHierarchyEndpoint);

        if (payload['data']['status']) {
            return this.http.put<R>(`${this._url}/${payload['id']}`, payload['data']);
        } else {
            return this.http.patch<R>(`${this._url}/${payload['id']}`, payload['data']);
        }
    }

    removePromoHierarchy<T = string, R = undefined>(payload: T): Observable<R> {
        if (typeof payload !== 'string') {
            throw new Error('ERR_DELETE_PROMO_HIERARCHY_REQUIRED_ID');
        }

        this._url = this._$helper.handleApiRouter(this._PromoHierarchyEndpoint);
        return this.http.delete<R>(`${this._url}/${payload}`);
    }
}
