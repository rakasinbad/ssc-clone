import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class CatalogueApiService
 */
@Injectable({
    providedIn: 'root'
})
export class CatalogueApiService {
    private _url: string;
    private readonly _endpoint = '/catalogues';
    private readonly _endpointPromo = '/get-segmentation-promo';


    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) {}

    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_CATALOGUE_REQUIRES_SUPPLIERID');
        }
        
        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['fakturName']) {
            newArgs.push({ key: 'fakturName', value: params['fakturName'] });
        }

        if (params['keyword']) {
            params['search'] = [
                {
                    fieldName: 'name',
                    keyword: params['keyword']
                },
                {
                    fieldName: 'sku',
                    keyword: params['keyword']
                },
                {
                    fieldName: 'external_id',
                    keyword: params['keyword']
                }
            ];
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

        if(params['fakturId']) {
            newArgs.push({ key: 'fakturId', value: params['fakturId'] });
        }
        
        if (params['catalogueSegmentationId']) {
            newArgs.push({ key: 'catalogueSegmentationId', value: params['catalogueSegmentationId'] });
        }

        if (params['segment']) {
            newArgs.push({ key: 'segment', value: params['segment'] });
        }

        this._url = this.helper$.handleApiRouter(this._endpointPromo);
        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
