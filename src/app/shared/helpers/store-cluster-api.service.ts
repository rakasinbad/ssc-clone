import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams, IStoreCluster, IStoreClusterResponse } from '../models';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class StoreClusterApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreClusterApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreClusterApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreClusterApiService
     */
    private _endpoint = '/clusters';

    /**
     * Creates an instance of StoreClusterApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreClusterApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {}

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<IStoreClusterResponse[]>}
     * @memberof StoreClusterApiService
     */
    findAll(params: IQueryParams): Observable<IStoreClusterResponse[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IStoreClusterResponse[]>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<IStoreCluster[]>}
     * @memberof StoreClusterApiService
     */
    findAllDropdown(params: IQueryParams): Observable<IStoreCluster[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IStoreCluster[]>(this._url, { params: newParams });
    }
}
