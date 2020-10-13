import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { SupplierStore, SupplierStoreOptions } from 'app/shared/models/supplier.model';
import { Observable } from 'rxjs';
import {
    ICalculateSupplierStoreResponse,
    ICheckOwnerPhoneResponse,
    IResendStorePayload,
    ResendStore,
    Store as Merchant,
} from '../models';

@Injectable({ providedIn: 'root' })
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

    private readonly _endpointNewSupplierStores = '/supplier-stores-v2';

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
                      value: supplierId,
                  },
              ]
            : [];

        if (params['approvalStatus']) {
            newArg.push({
                key: 'approvalStatus',
                value: params['approvalStatus'],
            });
        }

        this._url = this._$helper.handleApiRouter(this._endpointNewSupplierStores);
        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
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
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId,
                  },
              ]
            : [];

        this._url = this._$helper.handleApiRouter(this._calculateSupplierStoresEndpoint);
        const newParams = this._$helper.handleParams(this._url, {}, ...newArg);

        return this.http.get<ICalculateSupplierStoreResponse>(this._url, { params: newParams });
    }

    resendStore(payload: IResendStorePayload): Observable<ResendStore> {
        this._url = this._$helper.handleApiRouter(this._resendStoresEndpoint);

        return this.http.post<ResendStore>(`${this._url}`, payload);
    }

    checkOwnerPhone(phoneNumber: string, supplierId: number): Observable<ICheckOwnerPhoneResponse> {
        this._url = this._$helper.handleApiRouter(this._checkOwnerPhoneEndpoint);
        return this.http.post<ICheckOwnerPhoneResponse>(`${this._url}`, {
            mobilePhoneNumber: phoneNumber,
            supplierId,
        });
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
