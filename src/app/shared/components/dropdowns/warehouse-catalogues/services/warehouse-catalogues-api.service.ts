import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StoreSegmentationTypesApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreSegmentationTypesApiService {
    private _url: string;
    private readonly _endpoint = '/warehouse-catalogues';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) {}

    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!params['catalogueId'] && !params['noCatalogueId']) {
            throw new Error('ERR_WAREHOUSE_CATALOGUE_REQUIRES_CATALOGUEID');
        }
        
        if (params['catalogueId'] && !params['noCatalogueId']) {
            newArgs.push({ key: 'catalogueId', value: params['catalogueId'] });
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
