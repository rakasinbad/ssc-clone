import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
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
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @returns {Observable<T>}
     * @memberof StoreSegmentApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<T>(this._url, { params: newParams });
    }

    // findAllDropdown(params: IQueryParams): Observable<IStoreSegment[]> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     const newParams = this._$helper.handleParams(this._url, params);

    //     return this.http.get<IStoreSegment[]>(this._url, { params: newParams });
    // }
}
