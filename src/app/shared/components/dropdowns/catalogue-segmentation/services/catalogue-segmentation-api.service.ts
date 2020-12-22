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
 * @class CatalogueSegmentationApiService
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogueSegmentationApiService {
    private _url: string;
    private readonly _endpoint = '/catalogue-segmentations';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) {}

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

        newArgs.push({ key: 'type', value: 'segmentation' });

        this._url = this.helper$.handleApiRouter(this._endpoint);

        const newParams = this.helper$.handleParamsCatalogue(this._url, params, ...newArgs);

        const newHeaders = this.helper$.handleHeaders(headers);

        return this.http.get<T>(this._url, { params: newParams, headers: newHeaders });
    }

}
