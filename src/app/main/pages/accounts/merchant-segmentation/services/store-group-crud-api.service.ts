import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';

import { StoreGroup } from '../models';

/**
 *
 *
 * @export
 * @class StoreGroupCrudApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreGroupCrudApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreGroupCrudApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreGroupCrudApiService
     */
    private readonly _endpoint = '/groups';

    /**
     * Creates an instance of StoreGroupCrudApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreGroupCrudApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @returns {Observable<StoreGroup>}
     * @memberof StoreGroupCrudApiService
     */
    create<T>(body: T): Observable<StoreGroup> {
        return this.http.post<StoreGroup>(this._url, body);
    }
}
