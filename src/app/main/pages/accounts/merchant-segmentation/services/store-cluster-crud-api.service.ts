import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';

import { StoreCluster } from '../models';

/**
 *
 *
 * @export
 * @class StoreClusterCrudApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreClusterCrudApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreClusterCrudApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreClusterCrudApiService
     */
    private readonly _endpoint = '/clusters';

    /**
     * Creates an instance of StoreClusterCrudApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreClusterCrudApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @returns {Observable<StoreCluster>}
     * @memberof StoreClusterCrudApiService
     */
    create<T>(body: T): Observable<StoreCluster> {
        return this.http.post<StoreCluster>(this._url, body);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @param {string} id
     * @returns {Observable<StoreCluster>}
     * @memberof StoreClusterCrudApiService
     */
    patch<T>(body: T, id: string): Observable<StoreCluster> {
        return this.http.patch<StoreCluster>(`${this._url}/${id}`, body);
    }
}
