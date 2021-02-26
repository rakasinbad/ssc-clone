import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { IQueryParamsVoucher, IQueryParams } from 'app/shared/models/query.model';
import { Observable, of } from 'rxjs';
import { PromoHierarchy } from '../models';

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

    updatePromoHierarchy<T>(body: T): Observable<PromoHierarchy> {
        const newArgs = {
            layer: body['layer'],
            group: body['group']
        };
        
        
        const _url = this._$helper.handleApiRouter(this._PromoHierarchyEndpoint);
        return this.http.put<PromoHierarchy>(`${_url}/${body['id']}?type=${body['promoType']}`, newArgs);
    }

    findById<T>(id: string, params?: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (params['type']) {
            newArg.push({
                key: 'type',
                value: params['type'],
            });
        }

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);
        return this.http.get<T>(`${this._url}/${id}`, { params: newParams });
    }

}
