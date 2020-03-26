import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StoreTypeApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreTypeApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreTypeApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreTypeApiService
     */
    private readonly _endpoint = '/segmentation-tree?type=type';

    /**
     * Creates an instance of StoreTypeApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreTypeApiService
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
     * @memberof StoreTypeApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (params['keyword']) {
            newArg.push({
                key: 'keyword',
                value: params['keyword']
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
