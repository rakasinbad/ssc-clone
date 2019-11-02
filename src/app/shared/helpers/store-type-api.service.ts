import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams, IStoreType, IStoreTypeResponse } from '../models';
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
    constructor(private http: HttpClient, private _$helper: HelperService) {}

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<IStoreTypeResponse[]>}
     * @memberof StoreTypeApiService
     */
    findAll(params: IQueryParams): Observable<IStoreTypeResponse[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IStoreTypeResponse[]>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<IStoreType[]>}
     * @memberof StoreTypeApiService
     */
    findAllDropdown(params: IQueryParams): Observable<IStoreType[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IStoreType[]>(this._url, { params: newParams });
    }
}
