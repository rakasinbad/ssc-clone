import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';

import { StoreType } from '../models';

/**
 *
 *
 * @export
 * @class StoreTypeCrudApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreTypeCrudApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreTypeCrudApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreTypeCrudApiService
     */
    private readonly _endpoint = '/types';

    /**
     * Creates an instance of StoreTypeCrudApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreTypeCrudApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @returns {Observable<StoreType>}
     * @memberof StoreTypeCrudApiService
     */
    create<T>(body: T): Observable<StoreType> {
        return this.http.post<StoreType>(this._url, body);
    }
}
