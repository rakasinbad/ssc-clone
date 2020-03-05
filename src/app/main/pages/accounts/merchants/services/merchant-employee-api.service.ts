import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { UserStore, UserStoreOptions } from '../models';

/**
 *
 *
 * @export
 * @class MerchantEmployeeApiService
 */
@Injectable({
    providedIn: 'root'
})
export class MerchantEmployeeApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof MerchantEmployeeApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof MerchantEmployeeApiService
     */
    private readonly _endpoint = '/user-stores';

    /**
     * Creates an instance of MerchantEmployeeApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof MerchantEmployeeApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @param {string} [storeId]
     * @returns {Observable<T>}
     * @memberof MerchantEmployeeApiService
     */
    findAll<T>(params: IQueryParams, storeId?: string): Observable<T> {
        const newArg = storeId
            ? [
                  {
                      key: 'storeId',
                      value: storeId
                  },
                  {
                      key: 'attendance',
                      value: 'latest'
                  }
              ]
            : [
                  {
                      key: 'attendance',
                      value: 'latest'
                  }
              ];
        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @param {UserStoreOptions} body
     * @param {string} id
     * @returns {Observable<UserStore>}
     * @memberof MerchantEmployeeApiService
     */
    patch(body: UserStoreOptions, id: string): Observable<UserStore> {
        return this.http.patch<UserStore>(`${this._url}/${id}`, body);
    }

    patchCustom<T>(body: T, id: string): Observable<UserStore> {
        return this.http.patch<UserStore>(`${this._url}/${id}`, body);
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<UserStore>}
     * @memberof MerchantEmployeeApiService
     */
    delete(id: string): Observable<UserStore> {
        return this.http.delete<UserStore>(`${this._url}/${id}`);
    }
}
