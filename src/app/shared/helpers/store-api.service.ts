import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';
import { Observable } from 'rxjs';

import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class StoreApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreApiService
     */
    private readonly _endpoint = '/stores';

    /**
     * Creates an instance of StoreApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<Merchant>}
     * @memberof StoreApiService
     */
    findById(id: string): Observable<Merchant> {
        return this.http.get<Merchant>(`${this._url}/${id}`);
    }
}
