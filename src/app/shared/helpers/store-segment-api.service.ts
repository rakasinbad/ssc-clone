import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams, IStoreSegment, IStoreSegmentResponse } from '../models';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class StoreSegmentApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreSegmentApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreSegmentApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreSegmentApiService
     */
    private readonly _endpoint = '/store-segments';

    /**
     * Creates an instance of StoreSegmentApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreSegmentApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {}

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<IStoreSegmentResponse[]>}
     * @memberof StoreSegmentApiService
     */
    findAll(params: IQueryParams): Observable<IStoreSegmentResponse[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IStoreSegmentResponse[]>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<IStoreSegment[]>}
     * @memberof StoreSegmentApiService
     */
    findAllDropdown(params: IQueryParams): Observable<IStoreSegment[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IStoreSegment[]>(this._url, { params: newParams });
    }
}
