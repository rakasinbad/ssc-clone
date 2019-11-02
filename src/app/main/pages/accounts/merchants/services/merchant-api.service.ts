import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import {
    BrandStore,
    IBrandStore,
    IBrandStoreResponse,
    IStoreEmployeeDetail,
    IStoreEmployeeResponse,
    StoreEmployee,
    StoreEmployeeDetail
} from '../models';

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
     *
     *
     * @private
     * @memberof MerchantApiService
     */
    private readonly _endpointEmployee = '/user-stores';

    /**
     *
     *
     * @private
     * @memberof MerchantApiService
     */
    private readonly _endpointEmployeeDetail = '/users';

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
    ) {}

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
        this._url = this._$helper.handleApiRouter(this._endpoint);
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
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.get<IBrandStore>(`${this._url}/${id}`);
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @param {string} [storeId]
     * @returns {Observable<IStoreEmployeeResponse>}
     * @memberof MerchantApiService
     */
    findAllEmployeeByStoreId(
        params: IQueryParams,
        storeId?: string
    ): Observable<IStoreEmployeeResponse> {
        const newArg = storeId
            ? [
                  {
                      key: 'storeId',
                      value: storeId
                  }
              ]
            : null;
        this._url = this._$helper.handleApiRouter(this._endpointEmployee);
        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get<IStoreEmployeeResponse>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<IStoreEmployeeDetail>}
     * @memberof MerchantApiService
     */
    findStoreEmployeeById(id: string): Observable<IStoreEmployeeDetail> {
        this._url = this._$helper.handleApiRouter(this._endpointEmployeeDetail);
        return this.http.get<IStoreEmployeeDetail>(`${this._url}/${id}`);
    }

    updatePatchEmployee(body: StoreEmployeeDetail, id: string): Observable<IStoreEmployeeDetail> {
        this._url = this._$helper.handleApiRouter(this._endpointEmployeeDetail);
        return this.http.patch<IStoreEmployeeDetail>(`${this._url}/${id}`, body);
    }

    deleteEmployee(id: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointEmployeeDetail);
        return this.http.delete<any>(`${this._url}/${id}`);
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

    /**
     *
     *
     * @returns {StoreEmployee[]}
     * @memberof MerchantApiService
     */
    initStoreEmployee(): StoreEmployee[] {
        return this._$generator.initGenerator(
            {
                id: null,
                userId: null,
                storeId: null,
                status: null,
                user: null
            },
            2,
            5
        );
    }

    /**
     *
     *
     * @returns {StoreEmployeeDetail}
     * @memberof MerchantApiService
     */
    initStoreEmployeeDetail(): StoreEmployeeDetail {
        return {
            id: '-',
            fullName: '-',
            email: '-',
            phoneNo: '-',
            mobilePhoneNo: '-',
            idNo: '-',
            taxNo: '-',
            status: null,
            imageUrl: '-',
            taxImageUrl: '-',
            idImageUrl: '-',
            selfieImageUrl: '-',
            roles: null,
            createdAt: '-',
            updatedAt: '-',
            deletedAt: '-'
        };
    }
}
