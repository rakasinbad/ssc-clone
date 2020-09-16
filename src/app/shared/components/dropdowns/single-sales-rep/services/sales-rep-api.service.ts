import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { IHeaderRequest } from 'app/shared/models/header.model';

@Injectable({
    providedIn: 'root'
})
export class SalesRepApiService {
    private _url: string;

    private readonly _endpoint = '/sales-reps';

    constructor(
        private http: HttpClient,
        private helper$: HelperService
    ) {}

    find<T>(params: IQueryParams, headers: IHeaderRequest = {}): Observable<T> {
        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_SINGLE_SALES_REP_REQUIRED_SUPPLIERID');
        }
        
        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        this._url = this.helper$.handleApiRouter(this._endpoint);

        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);

        const newHeaders = this.helper$.handleHeaders(headers);

        return this.http.get<T>(this._url, { params: newParams, headers: newHeaders });
    }
}
