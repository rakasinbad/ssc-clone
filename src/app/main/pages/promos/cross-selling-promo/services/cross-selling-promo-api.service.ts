import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { CrossSelling } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CrossSellingPromoApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof CrossSellingPromoApiService
     */
    private _url: string;
    private _urlSegment: string;

    /**
     *
     *
     * @private
     * @memberof CrossSellingPromoApiService
     */
    private readonly _endpoint = '/cross-selling-promo';
    private readonly _endpointPromo = '/get-segmentation-promo';
    private readonly _endpointSkp = '/SKP';

    /**
     * Creates an instance of CrossSellingPromoApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof CrossSellingPromoApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @returns {Observable<T>}
     * @memberof CrossSellingPromoApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (params['keyword']) {
            newArg.push({
                key: 'keyword',
                value: params['keyword'],
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @template T
     * @param {string} id
     * @param {IQueryParams} [params]
     * @returns {Observable<T>}
     * @memberof FlexiComboApiService
     */
    findById<T>(id: string, params?: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (params['data']) {
            newArg.push({
                key: 'data',
                value: params['data'],
            });
        }

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<T>(`${this._url}/${id}`, { params: newParams });
    }

    findSegmentPromo<T>(params: IQueryParams, type): Observable<T> {
        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_WAREHOUSE_REQUIRES_SUPPLIERID');
        }
        
        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['catalogueSegmentationId']) {
            newArgs.push({ key: 'catalogueSegmentationId', value: params['catalogueSegmentationId'] });
        }

        newArgs.push({ key: 'segment', value: type });

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }
        this._urlSegment = this._$helper.handleApiRouter(this._endpointPromo);
        const newParams = this._$helper.handleParams(this._urlSegment, params, ...newArgs);

        return this.http.get<T>(this._urlSegment, { params: newParams });
    }

     /**
     *
     *
     * @template T
     * @param {string} id
     * @param {IQueryParams} [params]
     * @returns {Observable<T>}
     * @memberof FlexiComboApiService
     */
    findByIdSkp<T>(id: string, params?: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        const _urlSkp = this._$helper.handleApiRouter(this._endpointSkp);

        const newParams = this._$helper.handleParams(_urlSkp, null, ...newArg);

        return this.http.get<T>(`${_urlSkp}/${id}`, { params: newParams });
    }

    create<T>(body: T): Observable<CrossSelling> {
        return this.http.post<CrossSelling>(this._url, body);
    }

    patch<T>(body: T, id: string): Observable<CrossSelling> {
        return this.http.patch<CrossSelling>(`${this._url}/${id}`, body);
    }

    put<T>(body: T, id: string): Observable<CrossSelling> {
        return this.http.put<CrossSelling>(`${this._url}/${id}`, body);
    }

    delete(id: string): Observable<CrossSelling> {
        return this.http.delete<CrossSelling>(`${this._url}/${id}`);
    }
}
