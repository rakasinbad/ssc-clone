import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { SupplierStore, SupplierStoreOptions } from 'app/shared/models/supplier.model';
import { Observable } from 'rxjs';

import { Store as Merchant, IResendStorePayload, IResendStoreResponse, ICalculateSupplierStoreResponse, ICheckOwnerPhoneResponse } from '../models';
import { IPaginatedResponse } from 'app/shared/models/global.model';

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
    private readonly _endpoint = '/supplier-stores';

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
     *
     *
     * @private
     * @memberof MerchantApiService
     */
    private readonly _endpointStore = '/stores';

    /**
     *
     *
     * @private
     * @memberof MerchantApiService
     */
    private readonly _resendStoresEndpoint = '/resend-stores';

    /**
     *
     *
     * @private
     * @memberof MerchantApiService
     */
    private readonly _checkOwnerPhoneEndpoint = '/check-owner-phone';

    /**
     *
     *
     * @private
     * @memberof MerchantApiService
     */
    private readonly _numberOfEmployeeEndpoint = '/number-of-employees';

    /**
     *
     *
     * @private
     * @memberof MerchantApiService
     */
    private readonly _calculateSupplierStoresEndpoint = '/calculate-supplier-stores';

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

    findAll<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        if (params['approvalStatus']) {
            newArg.push({
                key: 'approvalStatus',
                value: params['approvalStatus']
            });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });

        // .pipe(
        //     map(resp => {
        //         if (params.paginate) {
        //             const newRespPaginate = resp as PaginateResponse<SupplierStore>;
        //             const newRespData =
        //                 newRespPaginate.data && newRespPaginate.data.length > 0
        //                     ? [
        //                           ...newRespPaginate.data.map(row => {
        //                               const newStore = row.store
        //                                   ? new Merchant(
        //                                         row.store.id,
        //                                         row.store.storeCode,
        //                                         row.store.name,
        //                                         row.store.address,
        //                                         row.store.taxNo,
        //                                         row.store.longitude,
        //                                         row.store.latitude,
        //                                         row.store.largeArea,
        //                                         row.store.phoneNo,
        //                                         row.store.imageUrl,
        //                                         row.store.taxImageUrl,
        //                                         row.store.status,
        //                                         row.store.reason,
        //                                         row.store.parent,
        //                                         row.store.parentId,
        //                                         row.store.numberOfEmployee,
        //                                         row.store.externalId,
        //                                         row.store.storeTypeId,
        //                                         row.store.storeGroupId,
        //                                         row.store.storeSegmentId,
        //                                         row.store.urbanId,
        //                                         row.store.vehicleAccessibilityId,
        //                                         row.store.warehouseId,
        //                                         row.store.userStores,
        //                                         row.store.storeType,
        //                                         row.store.storeGroup,
        //                                         row.store.storeSegment,
        //                                         row.store.urban,
        //                                         row.store.storeConfig,
        //                                         row.store.createdAt,
        //                                         row.store.updatedAt,
        //                                         row.store.deletedAt
        //                                     )
        //                                   : null;

        //                               return new SupplierStore(
        //                                   row.id,
        //                                   row.supplierId,
        //                                   row.storeId,
        //                                   row.status,
        //                                   newStore,
        //                                   row.createdAt,
        //                                   row.updatedAt,
        //                                   row.deletedAt
        //                               );
        //                           })
        //                       ]
        //                     : newRespPaginate.data;

        //             return new PaginateResponse<SupplierStore>(
        //                 newRespPaginate.total,
        //                 newRespPaginate.limit,
        //                 newRespPaginate.skip,
        //                 newRespData
        //             );
        //         }

        //         const newResp = resp as SupplierStore;
        //         const newRespStore = newResp.store
        //             ? new Merchant(
        //                   newResp.store.id,
        //                   newResp.store.storeCode,
        //                   newResp.store.name,
        //                   newResp.store.address,
        //                   newResp.store.taxNo,
        //                   newResp.store.longitude,
        //                   newResp.store.latitude,
        //                   newResp.store.largeArea,
        //                   newResp.store.phoneNo,
        //                   newResp.store.imageUrl,
        //                   newResp.store.taxImageUrl,
        //                   newResp.store.status,
        //                   newResp.store.reason,
        //                   newResp.store.parent,
        //                   newResp.store.parentId,
        //                   newResp.store.numberOfEmployee,
        //                   newResp.store.externalId,
        //                   newResp.store.storeTypeId,
        //                   newResp.store.storeGroupId,
        //                   newResp.store.storeSegmentId,
        //                   newResp.store.urbanId,
        //                   newResp.store.vehicleAccessibilityId,
        //                   newResp.store.warehouseId,
        //                   newResp.store.userStores,
        //                   newResp.store.storeType,
        //                   newResp.store.storeGroup,
        //                   newResp.store.storeSegment,
        //                   newResp.store.urban,
        //                   newResp.store.storeConfig,
        //                   newResp.store.createdAt,
        //                   newResp.store.updatedAt,
        //                   newResp.store.deletedAt
        //               )
        //             : null;

        //         return new SupplierStore(
        //             newResp.id,
        //             newResp.supplierId,
        //             newResp.storeId,
        //             newResp.status,
        //             newRespStore,
        //             newResp.createdAt,
        //             newResp.updatedAt,
        //             newResp.deletedAt
        //         );
        //     })
        // );
    }

    findById(id: string): Observable<SupplierStore> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.get<SupplierStore>(`${this._url}/${id}`);
    }

    patch<T>(body: SupplierStoreOptions, id: string): Observable<T> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<T>(`${this._url}/${id}`, body);
    }

    delete<T>(id: string): Observable<T> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.delete<T>(`${this._url}/${id}`);
    }

    getStore(id: string): Observable<Merchant> {
        this._url = this._$helper.handleApiRouter(this._endpointStore);
        return this.http.get<Merchant>(`${this._url}/${id}`);
    }

    getTotalApprovalStatus(supplierId: string): Observable<ICalculateSupplierStoreResponse> {
        const newArg = supplierId ?
        [
            {
                key: 'supplierId',
                value: supplierId
            }
        ] : [];

        this._url = this._$helper.handleApiRouter(this._calculateSupplierStoresEndpoint);
        const newParams = this._$helper.handleParams(this._url, {}, ...newArg);

        return this.http.get<ICalculateSupplierStoreResponse>(this._url, { params: newParams });
    }

    resendStore(payload: IResendStorePayload): Observable<Array<IResendStoreResponse>> {
        this._url = this._$helper.handleApiRouter(this._resendStoresEndpoint);
        return this.http.post<Array<IResendStoreResponse>>(`${this._url}`, payload);
    }

    checkOwnerPhone(phoneNumber: string, supplierId: number): Observable<ICheckOwnerPhoneResponse> {
        this._url = this._$helper.handleApiRouter(this._checkOwnerPhoneEndpoint);
        return this.http.post<ICheckOwnerPhoneResponse>(`${this._url}`, { mobilePhoneNumber: phoneNumber, supplierId });
    }

    getNumberOfEmployee(): Observable<Array<{ amount: string }>> {
        this._url = this._$helper.handleApiRouter(this._numberOfEmployeeEndpoint);

        const newParams = this._$helper.handleParams(this._url, {}, { paginate: false });
        return this.http.get<Array<{ amount: string }>>(this._url, { params: newParams });
    }

    // findStoreById(id: string): Observable<IStoreEdit> {
    //     this._url = this._$helper.handleApiRouter(this._endpointStore);
    //     return this.http.get<IStoreEdit>(`${this._url}/${id}`);
    // }

    // findAllEmployeeByStoreId(
    //     params: IQueryParams,
    //     storeId?: string
    // ): Observable<IStoreEmployeeResponse> {
    //     const newArg = storeId
    //         ? [
    //               {
    //                   key: 'storeId',
    //                   value: storeId
    //               }
    //           ]
    //         : null;
    //     this._url = this._$helper.handleApiRouter(this._endpointEmployee);
    //     const newParams = this._$helper.handleParams(this._url, params, newArg);

    //     return this.http.get<IStoreEmployeeResponse>(this._url, { params: newParams });
    // }

    // findStoreEmployeeById(id: string): Observable<IStoreEmployeeDetail> {
    //     this._url = this._$helper.handleApiRouter(this._endpointEmployeeDetail);
    //     return this.http.get<IStoreEmployeeDetail>(`${this._url}/${id}`);
    // }

    // createStore(body: FormStore): Observable<IStoreCreateResponse> {
    //     this._url = this._$helper.handleApiRouter(this._endpointStore);
    //     return this.http.post<IStoreCreateResponse>(this._url, body);
    // }

    // updatePatchStore(body: FormStoreEdit, id: string): Observable<IStoreEditResponse> {
    //     this._url = this._$helper.handleApiRouter(this._endpointStore);
    //     return this.http.patch<IStoreEditResponse>(`${this._url}/${id}`, body);
    // }

    // updatePatchStatusStore(body: { status: string }, id: string): Observable<any> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     return this.http.patch<any>(`${this._url}/${id}`, body);
    // }

    // deleteStore(id: string): Observable<IBrandStoreDeleteResponse> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     return this.http.delete<IBrandStoreDeleteResponse>(`${this._url}/${id}`);
    // }

    // updatePatchEmployee(body: StoreEmployeeDetail, id: string): Observable<IStoreEmployeeDetail> {
    //     this._url = this._$helper.handleApiRouter(this._endpointEmployeeDetail);
    //     return this.http.patch<IStoreEmployeeDetail>(`${this._url}/${id}`, body);
    // }

    // updatePatchStatusEmployee(body: { status: string }, id: string): Observable<any> {
    //     this._url = this._$helper.handleApiRouter(this._endpointEmployee);
    //     return this.http.patch<any>(`${this._url}/${id}`, body);
    // }

    // deleteEmployee(id: string): Observable<any> {
    //     this._url = this._$helper.handleApiRouter(this._endpointEmployee);
    //     return this.http.delete<any>(`${this._url}/${id}`);
    // }

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
