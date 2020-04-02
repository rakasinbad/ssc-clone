import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StoreSegmentationClustersApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreSegmentationClustersApiService {
    private _url: string;
    private readonly _endpoint = '/clusters';

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
            throw new Error('ERR_STORE_SEGMENTATION_CLUSTERS_REQUIRE_SUPPLIERID');
        }
        
        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        this._url = this.helper$.handleApiRouter(this._endpoint);
        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(this._url, { params: newParams });
    }
}
