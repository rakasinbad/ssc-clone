import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { HttpClient } from '@angular/common/http';
import { Portfolio } from '../models/portfolios.model';
import { IQueryParams, IPaginatedResponse } from 'app/shared/models';
import { Observable } from 'rxjs';
import { Store } from 'app/main/pages/attendances/models';

@Injectable({
    providedIn: 'root'
})
export class StoresApiService {

    private _url: string;

    private readonly _storeEndpoint = '/stores';
    private readonly _storePortfolioListsEndpoint = '/store-portfolio-lists';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) { }

    findStores(params: IQueryParams): Observable<IPaginatedResponse<Store>> {
        const newArgs = [];

        if (!isNaN(params['portfolioId'])) {
            newArgs.push({
                key: 'portfolioId',
                value: params['portfolioId']
            });
        }

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (params['type'] && params['type'] !== 'all') {
            switch (params['type']) {
                case 'in-portfolio': newArgs.push({ key: 'type', value: 'inside' }); break;
                case 'out-portfolio': newArgs.push({ key: 'type', value: 'outside' }); break;
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


        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);

        return this.http.get<IPaginatedResponse<Store>>(this._url, { params: newParams });
    }

}
