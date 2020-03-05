import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

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
    private readonly _endpoint = '/store-groups';

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
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<T>(this._url, { params: newParams });
    }

    // findAllDropdown(params: IQueryParams): Observable<IStoreGroup[]> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     const newParams = this._$helper.handleParams(this._url, params);

    //     return this.http.get<IStoreGroup[]>(this._url, { params: newParams });
    // }
}
