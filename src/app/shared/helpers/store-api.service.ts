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
     * @param {string} [supplierId]
     * @returns {Observable<Merchant>}
     * @memberof StoreApiService
     */
    findById(id: string, supplierId?: string): Observable<Merchant> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<Merchant>(`${this._url}/${id}`, { params: newParams });
    }

    /**
     *
     *
     * @param {*} body
     * @returns {Observable<Merchant>}
     * @memberof StoreApiService
     */
    create(body: any): Observable<Merchant> {
        return this.http.post<Merchant>(this._url, body);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @param {string} id
     * @returns {Observable<Merchant>}
     * @memberof StoreApiService
     */
    patchCustom<T>(body: T, id: string): Observable<Merchant> {
        return this.http.patch<Merchant>(`${this._url}/${id}`, body);
    }
}
