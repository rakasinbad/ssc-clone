import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import { BrandStore, IBrandStore, IBrandStoreResponse } from '../models';

/**
 *
 *
 * @export
 * @class MerchantApiService
 */
@Injectable({
    providedIn: 'root'
})
export class MerchantApiService {
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
    private readonly _endpoint = '/brand-stores';

    /**
     * Creates an instance of MerchantApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof MerchantApiService
     */
    constructor(
        private http: HttpClient,
        private _$generator: GeneratorService,
        private _$helper: HelperService
    ) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @param {string} [brandId]
     * @returns {Observable<IBrandStoreResponse>}
     * @memberof MerchantApiService
     */
    findAll(params: IQueryParams, brandId?: string): Observable<IBrandStoreResponse> {
        const newArg = brandId
            ? [
                  {
                      key: 'brandId',
                      value: brandId
                  }
              ]
            : null;
        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get<IBrandStoreResponse>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<IBrandStore>}
     * @memberof MerchantApiService
     */
    findById(id: string): Observable<IBrandStore> {
        return this.http.get<IBrandStore>(`${this._url}/${id}`);
    }

    /**
     *
     *
     * @returns {BrandStore[]}
     * @memberof MerchantApiService
     */
    initBrandStore(): BrandStore[] {
        return this._$generator.initGenerator(
            {
                brandId: null,
                createdAt: null,
                deletedAt: null,
                id: null,
                status: null,
                store: null,
                storeId: null,
                updatedAt: null
            },
            2,
            5
        );
    }
}
