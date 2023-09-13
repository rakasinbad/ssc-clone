import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class BrandsApiService
 */
@Injectable({
    providedIn: 'root'
})
export class BrandsApiService {
    private _url: string;
    private readonly _endpoint = '/brands';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) {}

    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_BRAND_REQUIRES_SUPPLIERID');
        }

        if (params['status'] !== null || typeof params['status'] !== 'undefined') {
            newArgs.push({ key: 'status', value: params['status'] });
        }

        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['keyword']) {
            params['search'] = [
                {
                    fieldName: 'name',
                    keyword: params['keyword']
                },
                {
                    fieldName: 'code',
                    keyword: params['keyword']
                },
            ];
        }

        this._url = this.helper$.handleApiRouter(this._endpoint);
        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(this._url, { params: newParams, headers: {
            "X-Replica": "true",
        }});
    }
}
