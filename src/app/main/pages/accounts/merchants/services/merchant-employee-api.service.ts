import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams, SupplierStoreOptions } from 'app/shared/models';
import { Observable } from 'rxjs';
import { UserStoreOptions } from '../models';

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

    constructor(private http: HttpClient, private _$helper: HelperService) {}

    findAll<T>(params: IQueryParams, storeId?: string): Observable<T> {
        const newArg = storeId
            ? [
                  {
                      key: 'storeId',
                      value: storeId
                  }
              ]
            : null;

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get<T>(this._url, {
            params: newParams
        });
    }

    patch<T>(body: UserStoreOptions, id: string): Observable<T> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<T>(`${this._url}/${id}`, body);
    }
}
