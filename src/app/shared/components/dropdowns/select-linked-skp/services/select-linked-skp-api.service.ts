import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { IHeaderRequest } from 'app/shared/models/header.model';

/**
 *
 *
 * @export
 * @class SelectLinkedSKPApiService
 */
@Injectable({
  providedIn: 'root'
})
export class SelectLinkedSkpApiService {
    private _url: string;
    private readonly _endpoint = '/SKP';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) {}

    find<T>(params: IQueryParams, headers: IHeaderRequest = {}): Observable<T> {
        const newArgs = [];
        console.log('isi params find->', params)
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

        newArgs.push({ key: 'promoEndDate', value: params['promoEndDate'] });

        this._url = this.helper$.handleApiRouter(this._endpoint);

        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);
        console.log('newParams api->', newParams)
        const newHeaders = this.helper$.handleHeaders(headers);

        return this.http.get<T>(this._url, { params: newParams, headers: newHeaders });
    }

}
