import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class WarehousesApiService
 */
@Injectable({
    providedIn: 'root'
})
export class WarehousesApiService {
    private _url: string;
    private readonly _endpoint = '/warehouses';
    private readonly _endpointPromo = '/get-segmentation-promo';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) {}

    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_WAREHOUSE_REQUIRES_SUPPLIERID');
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

    findSegmentPromo<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_WAREHOUSE_REQUIRES_SUPPLIERID');
        }
        
        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['catalogueId']) {
            newArgs.push({ key: 'catalogueId', value: params['catalogueId'] });
        }

        if (params['brandId']) {
            newArgs.push({ key: 'brandId', value: params['brandId'] });
        }

        if (params['fakturId']) {
            newArgs.push({ key: 'fakturId', value: params['fakturId'] });
        }

        if (params['segment']) {
            newArgs.push({ key: 'segment', value: params['segment'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        this._url = this.helper$.handleApiRouter(this._endpointPromo);
        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);
        delete newParams['$skip'];
        delete newParams['$limit'];
        delete newParams['paginate'];

        return this.http.get<T>(this._url, { params: newParams });
    }
}
