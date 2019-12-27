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

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) { }

    findStores(params: IQueryParams): Observable<IPaginatedResponse<Store>> {
        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        this._url = this.helper$.handleApiRouter(this._storeEndpoint);
        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);

        return this.http.get<IPaginatedResponse<Store>>(this._url, { params: newParams });
    }

}
