import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class DistrictApiService
 */
@Injectable({
    providedIn: 'root'
})
export class DistrictApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof DistrictApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof DistrictApiService
     */
    private readonly _endpoint = '/districts';

    /**
     * Creates an instance of DistrictApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof DistrictApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findAll<T>(params: IQueryParams): Observable<T> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<T>(this._url, {
            params: newParams, 
            headers: {
                "X-Replica": "true",
            }
        });
    }
}
