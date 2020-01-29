import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams, SupplierStore, SupplierStoreOptions } from 'app/shared/models';
import { Observable } from 'rxjs';
import { StoreSetting } from '../models';

/**
 *
 *
 * @export
 * @class MerchantApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreSettingApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof MerchantApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof MerchantApiService
     */
    private readonly _endpoint = '/supplier-settings';

    /**
     * Creates an instance of MerchantApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof MerchantApiService
     */
    constructor(
        private http: HttpClient,
        private _$helper: HelperService
    ) {}

    findAll<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        const newArg = supplierId
            ? [
                {
                    key: 'supplierId',
                    value: supplierId
                }
            ] : [];

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    findById(id: string): Observable<SupplierStore> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.get<SupplierStore>(`${this._url}/${id}`);
    }

    create(body: Partial<StoreSetting>): Observable<StoreSetting> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.post<StoreSetting>(this._url, body);
    }

    patch<T>(body: SupplierStoreOptions, id: string): Observable<T> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<T>(`${this._url}/${id}`, body);
    }

    // delete<T>(id: string): Observable<T> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     return this.http.delete<T>(`${this._url}/${id}`);
    // }

    getStoreSetting(id: string): Observable<StoreSetting> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.get<StoreSetting>(`${this._url}/${id}`);
    }
}
