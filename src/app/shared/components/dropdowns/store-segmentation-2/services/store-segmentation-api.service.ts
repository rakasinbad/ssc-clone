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
export class StoreSegmentationApiService {
    private _url: string;
    private readonly _endpoint = '/types';
    private readonly _typeEndpoint = '/types';
    private readonly _groupEndpoint = '/groups';
    private readonly _channelEndpoint = '/channels';
    private readonly _clusterEndpoint = '/clusters';

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
            throw new Error('ERR_STORE_SEGMENTATION_TYPES_REQUIRE_SUPPLIERID');
        }
        
        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        if (!params['segmentation']) {
            throw new Error('ERR_SERVICE_REQUIRE_VALID_SEGMENTATION');
        } else {
            switch (params['segmentation']) {
                case 'type': {
                    this._url = this.helper$.handleApiRouter(this._typeEndpoint);
                    break;
                }
                case 'group': {
                    this._url = this.helper$.handleApiRouter(this._groupEndpoint);
                    break;
                }
                case 'channel': {
                    this._url = this.helper$.handleApiRouter(this._channelEndpoint);
                    break;
                }
                case 'cluster': {
                    this._url = this.helper$.handleApiRouter(this._clusterEndpoint);
                    break;
                }
                default: {
                    throw new Error('ERR_SERVICE_REQUIRE_VALID_SEGMENTATION');
                }
            }
        }

        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(this._url, { params: newParams });
    }
}
