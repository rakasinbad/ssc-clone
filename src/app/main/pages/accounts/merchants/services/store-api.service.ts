import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams, IPaginatedResponse } from 'app/shared/models';
import { Observable } from 'rxjs';

import {
    Store
} from '../models';

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
     * @param {string} [supplierId]
     * @returns {Observable<Store>}
     * @memberof StoreApiService
     */
    findAllStore(params: IQueryParams, supplierId?: string): Observable<IPaginatedResponse<Store>> {
        const newArg = supplierId
            ? [
                {
                    key: 'supplierId',
                    value: supplierId
                }
            ]
            : null;
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get<IPaginatedResponse<Store>>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<Store>}
     * @memberof StoreeApiService
     */
    findStoreById(id: string): Observable<Store> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.get<Store>(`${this._url}/${id}?type=attendance`);
    }

    /**
     *
     *
     * @param {Partial<Store>} store
     * @returns {Observable<Store>}
     * @memberof StoreApiService
     */
    createStore(store: Partial<Store>): Observable<Store> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.post<Store>(this._url, store);
    }

    /**
     *
     *
     * @param {Partial<Store>} store
     * @param {string} id
     * @returns {Observable<Store>}
     * @memberof StoreApiService
     */
    patchStore(store: Partial<Store>, id: string): Observable<Store> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<Store>(`${this._url}/${id}`, store);
    }

    deleteStore(id: string): Observable<Store> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.delete<Store>(`${this._url}/${id}`);
    }

    /**
     *
     *
     * @returns {BrandStore[]}
     * @memberof MerchantApiService
     */
    // initBrandStore(): BrandStore[] {
    //     return this._$generator.initGenerator(
    //         {
    //             brandId: null,
    //             createdAt: null,
    //             deletedAt: null,
    //             id: null,
    //             status: null,
    //             store: null,
    //             storeId: null,
    //             updatedAt: null
    //         },
    //         2,
    //         5
    //     );
    // }

    /**
     *
     *
     * @returns {StoreEmployee[]}
     * @memberof MerchantApiService
     */
    // initStoreEmployee(): StoreEmployee[] {
    //     return this._$generator.initGenerator(
    //         {
    //             id: null,
    //             userId: null,
    //             storeId: null,
    //             status: null,
    //             user: null
    //         },
    //         2,
    //         5
    //     );
    // }

    /**
     *
     *
     * @returns {StoreEmployeeDetail}
     * @memberof MerchantApiService
     */
    // initStoreEmployeeDetail(): StoreEmployeeDetail {
    //     return {
    //         id: '-',
    //         fullName: '-',
    //         email: '-',
    //         phoneNo: '-',
    //         mobilePhoneNo: '-',
    //         idNo: '-',
    //         taxNo: '-',
    //         status: null,
    //         imageUrl: '-',
    //         taxImageUrl: '-',
    //         idImageUrl: '-',
    //         selfieImageUrl: '-',
    //         roles: null,
    //         createdAt: '-',
    //         updatedAt: '-',
    //         deletedAt: '-'
    //     };
    // }
}
