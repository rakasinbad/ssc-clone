import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { HttpClient } from '@angular/common/http';
import { Portfolio } from '../models/portfolios.model';
import { IQueryParams, IPaginatedResponse } from 'app/shared/models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PortfoliosApiService {

    private _url: string;

    private readonly _endpoint = '/portfolios';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) { }

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
}
