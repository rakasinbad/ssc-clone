import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';
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
     *
     *
     * @private
     * @memberof StoreApiService
     */
    private readonly _supplierStoreEndpoint = '/supplier-stores';

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
     * @returns {Observable<any>}
     * @memberof StoreApiService
     */
    findById(id: string, supplierId?: string): Observable<any> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<any>(`${this._url}/${id}`, { params: newParams });
    }

    /**
     *
     *
     * @param {*} body
     * @returns {Observable<any>}
     * @memberof StoreApiService
     */
    create(body: any): Observable<any> {
        if (body['supplierStore']) {
            this._url = this._$helper.handleApiRouter(this._supplierStoreEndpoint);
        } else {
            this._url = this._$helper.handleApiRouter(this._endpoint);
        }

        const newBody = {};
        Object.keys(body).forEach(key => {
            if (key !== 'supplierStore') {
                newBody[key] = body[key];
            }
        });

        return this.http.post<any>(this._url, newBody);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @param {string} id
     * @returns {Observable<any>}
     * @memberof StoreApiService
     */
    patchCustom<T>(body: T, id: string, isSupplierStore?: boolean): Observable<any> {
        if (body['supplierStore'] || isSupplierStore) {
            this._url = this._$helper.handleApiRouter(this._supplierStoreEndpoint);
        } else {
            this._url = this._$helper.handleApiRouter(this._endpoint);
        }

        const newBody = {};
        Object.keys(body).forEach(key => {
            if (key !== 'supplierStore') {
                newBody[key] = body[key];
            }
        });

        if (id) {
            return this.http.patch<any>(`${this._url}/${id}`, newBody);
        }

        return this.http.patch<any>(`${this._url}`, newBody);
    }
}
