import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StoreGroupApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreGroupApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreGroupApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreGroupApiService
     */
    private readonly _endpoint = '/segmentation-tree?type=group';

    /**
     * Creates an instance of StoreGroupApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreGroupApiService
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
     * @memberof StoreGroupApiService
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
