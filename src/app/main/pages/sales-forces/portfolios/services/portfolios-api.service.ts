import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { HttpClient } from '@angular/common/http';
import { Portfolio, IPortfolioAddForm } from '../models/portfolios.model';
import { IQueryParams, IPaginatedResponse } from 'app/shared/models';
import { Observable } from 'rxjs';
import { Store } from 'app/main/pages/attendances/models';

@Injectable({
    providedIn: 'root'
})
export class PortfoliosApiService {

    private _url: string;

    private readonly _endpoint = '/portfolios';
    private readonly _storeEndpoint = '/stores';
    private readonly _exportEndpoint = '/download/export-portfolios';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) { }

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

        this._url = this.helper$.handleApiRouter(this._endpoint);
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
}
