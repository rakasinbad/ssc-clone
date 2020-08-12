import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { HelperService } from 'app/shared/helpers';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { IPortfolioAddForm, Portfolio } from '../models/portfolios.model';

@Injectable({
    providedIn: 'root'
})
export class PortfoliosApiService {
    private _url: string;

    private readonly _endpoint = '/portfolios';
    private readonly _associationEndpoint = '/associations';
    private readonly _storeEndpoint = '/stores';
    private readonly _exportEndpoint = '/download/export-portfolios';

    constructor(private http: HttpClient, private helper$: HelperService) {}

    exportPortfoliosRequest(supplierId: string): Observable<{ url: string }> {
        this._url = this.helper$.handleApiRouter(this._exportEndpoint);
        return this.http.get<{ url: string }>(`${this._url}?supplierId=${supplierId}`);
    }

    findPortfolio(id: string): Observable<Portfolio> {
        this._url = this.helper$.handleApiRouter(this._endpoint);
        return this.http.get<Portfolio>(`${this._url}/${id}`);
    }

    findPortfolios(params: IQueryParams): Observable<IPaginatedResponse<Portfolio>> {
        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (params['type']) {
            switch (params['type']) {
                case 'outside':
                case 'inside':
                    newArgs.push({ key: 'type', value: params['type'] });
                    break;
            }
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        if (!isNaN(params['warehouseId'])) {
            newArgs.push({ key: 'warehouseId', value: params['warehouseId'] });
        }

        if (params['request'] === 'associations') {
            this._url = this.helper$.handleApiRouter(this._associationEndpoint);
        } else {
            this._url = this.helper$.handleApiRouter(this._endpoint);
        }

        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);

        return this.http.get<IPaginatedResponse<Portfolio>>(this._url, { params: newParams });
    }

    findPortfolioStores(params: IQueryParams): Observable<IPaginatedResponse<Store>> {
        const newArgs = [];

        if (!isNaN(params['portfolioId'])) {
            newArgs.push({
                key: 'portfolioId',
                value: params['portfolioId']
            });
        }

        this._url = this.helper$.handleApiRouter(this._storeEndpoint);
        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);

        return this.http.get<IPaginatedResponse<Store>>(this._url, { params: newParams });
    }

    createPortfolio(data: IPortfolioAddForm): Observable<Portfolio> {
        this._url = this.helper$.handleApiRouter(this._endpoint);
        return this.http.post<Portfolio>(this._url, data);
    }

    patchPortfolio(id: string, data: IPortfolioAddForm): Observable<Portfolio> {
        this._url = this.helper$.handleApiRouter(this._endpoint);
        return this.http.patch<Portfolio>(`${this._url}/${id}`, data);
    }
}
