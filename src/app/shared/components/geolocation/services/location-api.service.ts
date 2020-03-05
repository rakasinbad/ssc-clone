import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class AssociationApiService
 */
@Injectable({
    providedIn: 'root'
})
export class LocationApiService {
    private _url: string;
    private readonly _provinceEndpoint = '/provinces';
    private readonly _locationEndpoint = '/locations';

    constructor(
        private http: HttpClient,
        private _$helper: HelperService,
    ) {}

    findLocation<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];
        const needLocationTypes = ['city', 'district', 'urban'];

        if (needLocationTypes.includes(params['locationType'])) {
            newArgs.push({ key: 'type', value: params['locationType'] });
        }

        switch (params['locationType']) {
            case 'city': {
                if (!params['provinceId']) {
                    throw new Error('provinceId is required.');
                }
                newArgs.push({ key: 'provinceId', value: params['provinceId'] });

                this._url = this._$helper.handleApiRouter(this._locationEndpoint);
                break;
            }
            case 'district': {
                if (!params['city']) {
                    throw new Error('city is required.');
                }
                newArgs.push({ key: 'city', value: params['city'] });

                this._url = this._$helper.handleApiRouter(this._locationEndpoint);
                break;
            }
            case 'urban': {
                if (!params['district']) {
                    throw new Error('district is required.');
                }
                newArgs.push({ key: 'district', value: params['district'] });

                this._url = this._$helper.handleApiRouter(this._locationEndpoint);
                break;
            }
            case 'province': {
                this._url = this._$helper.handleApiRouter(this._provinceEndpoint);
                
                break;
            }
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(this._url, { params: newParams });
    }

}
