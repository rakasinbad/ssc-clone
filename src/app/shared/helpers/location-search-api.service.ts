import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Urban } from '../models';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class LocationSearchApiService
 */
@Injectable({
    providedIn: 'root'
})
export class LocationSearchApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof LocationSearchApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof LocationSearchApiService
     */
    private readonly _endpoint = '/location-search';

    /**
     * Creates an instance of LocationSearchApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof LocationSearchApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {{
     *         province: string;
     *         city: string;
     *         district: string;
     *         urban: string;
     *     }} body
     * @returns {Observable<T>}
     * @memberof LocationSearchApiService
     */
    findLocation<T>(body: {
        province: string;
        city: string;
        district: string;
        urban: string;
    }): Observable<T> {
        return this.http.post<T>(this._url, body);
    }
}
