import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import {
    CreditLimitGroup,
    CreditLimitStore,
    CreditLimitStoreOptions,
    ICreditLimitStoreResponse
} from '../models';

@Injectable({
    providedIn: 'root'
})
export class CreditLimitBalanceApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof CreditLimitBalanceApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof CreditLimitBalanceApiService
     */
    private readonly _endpoint = '/credit-limit-stores';

    /**
     *
     *
     * @private
     * @memberof CreditLimitBalanceApiService
     */
    private readonly _endpointGroup = '/credit-limit-groups';

    /**
     * Creates an instance of CreditLimitBalanceApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof CreditLimitBalanceApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {}

    findAllGroup(params: IQueryParams, brandId?: string): Observable<CreditLimitGroup[]> {
        const newArg = brandId
            ? [
                  {
                      key: 'brandId',
                      value: brandId
                  }
              ]
            : null;

        this._url = this._$helper.handleApiRouter(this._endpointGroup);
        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get<CreditLimitGroup[]>(this._url, { params: newParams });
    }

    findAllStore(params: IQueryParams, brandId?: string): Observable<ICreditLimitStoreResponse> {
        const newArg = brandId
            ? [
                  {
                      key: 'brandId',
                      value: brandId
                  },
                  {
                      key: 'type',
                      value: 'order'
                  }
              ]
            : [
                  {
                      key: 'type',
                      value: 'order'
                  }
              ];

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get<ICreditLimitStoreResponse>(this._url, { params: newParams });
    }

    findStoreById(id: string): Observable<CreditLimitStore> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.get<CreditLimitStore>(`${this._url}/${id}`);
    }

    updatePatch(body: CreditLimitStoreOptions, id: string): Observable<CreditLimitStore> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<CreditLimitStore>(`${this._url}/${id}`, body);
    }
}
