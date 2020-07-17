import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { TStoreSegmentation } from '../models';
import { StoreSegmentationType } from 'app/main/pages/catalogues/models';
import { map } from 'rxjs/operators';
import { TNullable } from 'app/shared/models/global.model';

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
    private readonly _typeEndpoint = '/types';
    private readonly _groupEndpoint = '/groups';
    private readonly _channelEndpoint = '/channels';
    private readonly _clusterEndpoint = '/clusters';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) {}

    resolve(id: number, segmentation: TStoreSegmentation): Observable<{ data: TNullable<Array<StoreSegmentationType>>, text: TNullable<string> }> {
        switch (segmentation) {
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

        const args: IQueryParams = {
            paginate: false
        };

        const newParams = this.helper$.handleParams(this._url, args);

        return this.http.get<Array<StoreSegmentationType>>(this._url, { params: newParams }).pipe(
            map((values: Array<StoreSegmentationType>) => {
                // Menyimpan nama type-nya, dari child menuju parent.
                const types: Array<StoreSegmentationType> = [];
                // Mendapatkan data type berdasarkan ID nya.
                let type = values.find(value => +value.id === +id);

                if (!type) {
                    return {
                        data: null,
                        text: null
                    };
                }

                do {
                    // Memasukkan type yang ditemukan ke array.
                    types.push(type);

                    // Melanjutkan pencarian segmentation-nya jika ada parent-nya.
                    if (type.parentId) {
                        // Mendapatkan ID parent-nya.
                        const parentId = type.parentId;
                        // Mencari parent-nya dari ID yang telah ditemukan sebelumnya.
                        type = values.find(value => +value.id === +parentId);
                    } else {
                        // Kalau tidak ada, tidak dilanjutkan.
                        type = null;
                    }
                } while (type);

                return {
                    data: types,
                    text: types.map(t => t ? `<p class="my-12">${t.name}</p>` : '<p class="my-12">(unknown)</p>')
                                .join('<span class="material-icons font-size-28">chevron_right</span>')
                };
            })
        );
    }

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
