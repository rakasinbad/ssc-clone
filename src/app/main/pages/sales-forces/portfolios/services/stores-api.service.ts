import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { HelperService } from 'app/shared/helpers';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { IHeaderRequest } from 'app/shared/models/header.model';
import { StorePortfolio } from '../models';

@Injectable({
    providedIn: 'root'
})
export class StoresApiService {
    private _url: string;

    private readonly _storeEndpoint = '/stores';
    private readonly _storePortfolioListsEndpoint = '/store-portfolio-lists';

    constructor(private http: HttpClient, private helper$: HelperService) {}

    findStores(params: IQueryParams): Observable<IPaginatedResponse<StorePortfolio>> {
        const newArgs = [];

        if (!isNaN(params['portfolioId'])) {
            newArgs.push({
                key: 'portfolioId',
                value: params['portfolioId']
            });
        }

        if (params['keyword']) {
            newArgs.push({
                key: 'keyword',
                value: params['keyword']
            });
        }

        if (!isNaN(params['supplierId']) && !params['noSupplierId']) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (params['type'] && params['type'] !== 'all') {
            switch (params['type']) {
                case 'in-portfolio':
                    newArgs.push({ key: 'type', value: 'inside' });
                    break;
                case 'out-portfolio':
                    newArgs.push({ key: 'type', value: 'outside' });
                    break;
            }

            if (!isNaN(params['warehouseId'])) {
                newArgs.push({
                    key: 'warehouseId',
                    value: params['warehouseId']
                });
            }

            this._url = this.helper$.handleApiRouter(this._storePortfolioListsEndpoint);
        } else {
            if (!isNaN(params['portfolioId'])) {
                newArgs.push({
                    key: 'portfolioId',
                    value: params['portfolioId']
                });
            }

            if (!isNaN(params['storeType'])) {
                newArgs.push({
                    key: 'storeTypeId',
                    value: params['storeType']
                });
            }

            if (!isNaN(params['storeSegment'])) {
                newArgs.push({
                    key: 'storeSegmentId',
                    value: params['storeSegment']
                });
            }

            this._url = this.helper$.handleApiRouter(this._storeEndpoint);
        }

        const newHeaders = this.helper$.handleHeaders(params);

        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);

        return this.http.get<IPaginatedResponse<StorePortfolio>>(this._url, { params: newParams, headers: newHeaders });
    }

    isStoreAtPortfolio(
        storeId: number,
        warehouseId: number,
        invoiceGroupId?: number
    ): Observable<{ message: string; portfolioId?: string; name?: string; code?: string }> {
        this._url = this.helper$.handleApiRouter(this._storePortfolioListsEndpoint);

        const payload = { storeId, warehouseId };

        if (invoiceGroupId) {
            payload['invoiceGroupId'] = invoiceGroupId;
        }

        return this.http.post<{
            message: string;
            portfolioId?: string;
            name?: string;
            code?: string;
        }>(this._url, payload);
    }
}
