import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StoreSegmentationGroupsApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreSegmentationGroupsApiService {
    private _url: string;
    private readonly _endpoint = '/groups';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) {}

    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (params['hasChild'] === true || params['hasChild'] === false) {
            newArgs.push({ key: 'hasChild', value: String(params['hasChild']) });
        }

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_STORE_SEGMENTATION_GROUPS_REQUIRE_SUPPLIERID');
        }
        
        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        this._url = this.helper$.handleApiRouter(this._endpoint);
        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(this._url, { params: newParams, headers: {
            "X-Replica": "true",
        } });
    }
}
