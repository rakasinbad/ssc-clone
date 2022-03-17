import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Store } from 'app/main/pages/accounts/merchants/models';
import { HelperService } from 'app/shared/helpers';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { IHeaderRequest } from 'app/shared/models/header.model';

@Injectable({
    providedIn: 'root'
})
export class WarehousesApiService {
    private _url: string;

    private readonly _endpoint = '/warehouses-list';

    constructor(private http: HttpClient, private helper$: HelperService) {}

    find<T>(params: IQueryParams, headers: IHeaderRequest = {}): Observable<T> {
        const newArgs = [];

        if (params['keyword']) {
            newArgs.push({
                key: 'keyword',
                value: params['keyword']
            });
        }

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        this._url = this.helper$.handleApiRouter(this._endpoint);

        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);

        const newHeaders = this.helper$.handleHeaders(headers);

        return this.http.get<T>(this._url, { params: newParams, headers: newHeaders });
    }
}
