import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models';
import { HelperService } from './helper.service';

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
    private readonly _endpoint = '/store-types';

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
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<T>(this._url, { params: newParams });
    }

    // findAllDropdown(params: IQueryParams): Observable<IStoreType[]> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     const newParams = this._$helper.handleParams(this._url, params);

    //     return this.http.get<IStoreType[]>(this._url, { params: newParams });
    // }
}
