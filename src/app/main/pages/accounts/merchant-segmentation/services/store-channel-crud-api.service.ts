import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';

import { StoreChannel } from '../models';

/**
 *
 *
 * @export
 * @class StoreChannelCrudApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreChannelCrudApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreChannelCrudApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreChannelCrudApiService
     */
    private readonly _endpoint = '/channels';

    /**
     * Creates an instance of StoreChannelCrudApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreChannelCrudApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @returns {Observable<StoreChannel>}
     * @memberof StoreChannelCrudApiService
     */
    create<T>(body: T): Observable<StoreChannel> {
        return this.http.post<StoreChannel>(this._url, body);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @param {string} id
     * @returns {Observable<StoreChannel>}
     * @memberof StoreChannelCrudApiService
     */
    patch<T>(body: T, id: string): Observable<StoreChannel> {
        return this.http.patch<StoreChannel>(`${this._url}/${id}`, body);
    }
}
