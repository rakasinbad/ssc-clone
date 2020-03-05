import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class ClusterApiService
 */
@Injectable({
    providedIn: 'root'
})
export class ClusterApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof ClusterApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof ClusterApiService
     */
    private readonly _endpoint = '/clusters';

    /**
     * Creates an instance of ClusterApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof ClusterApiService
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
     * @memberof ClusterApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
