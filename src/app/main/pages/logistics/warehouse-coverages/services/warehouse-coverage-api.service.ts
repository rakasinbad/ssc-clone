import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HelperService } from '../../../../../shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';

@Injectable({
    providedIn: 'root'
})
export class WarehouseCoverageApiService {
    private _url: string;
    private readonly _endpoint = '/warehouse-coverages';
    private readonly _endpointWarehouseUrbans = '/warehouse-urbans';

    constructor(
        private http: HttpClient,
        private _$helper: HelperService,
    ) {}

    findAll<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!params['supplierId']) {
            throw new Error('supplierId is required.');
        } else {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['viewBy'] && params['viewBy'] !== 'area' && params['viewBy'] !== 'warehouse') {
            throw new Error('viewBy only accept: area, warehouse.');
        } else {
            newArgs.push({ key: 'viewBy', value: params['viewBy'] });

            if (params['viewBy'] === 'area') {
                if (params['type'] && params['type'] !== 'covered' && params['type'] !== 'not_covered') {
                    throw new Error('type only accept: covered, not_covered.');
                } else {
                    newArgs.push({ key: 'type', value: params['type'] });
                }

                if (!params['province']) {
                    throw new Error('province is required.');
                } else {
                    newArgs.push({ key: 'province', value: params['province'] });
                }
        
                if (!params['city']) {
                    throw new Error('city is required.');
                } else {
                    newArgs.push({ key: 'city', value: params['city'] });
                }
        
                if (!params['district']) {
                    throw new Error('district is required.');
                } else {
                    newArgs.push({ key: 'district', value: params['district'] });
                }
        
                if (!params['urban']) {
                    throw new Error('urban is required.');
                } else {
                    newArgs.push({ key: 'urban', value: params['urban'] });
                }
            } else if (params['viewBy'] === 'warehouse') {
                if (!params['warehouseId']) {
                    throw new Error('warehouseId is required.');
                } else {
                    newArgs.push({ key: 'warehouseId', value: params['warehouseId'] });
                }
            }
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(this._url, { params: newParams });
    }

    findCoverage<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!params['warehouseId']) {
            throw new Error('warehouseId is required.');
        } else {
            newArgs.push({ key: 'warehouseId', value: params['warehouseId'] });
        }

        this._url = this._$helper.handleApiRouter(this._endpointWarehouseUrbans);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(this._url, { params: newParams });
    }

    createWarehouseCoverage<T>(payload: { warehouseId: number; urbanId: Array<number>; }): Observable<T> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.post<T>(this._url, payload);
    }

    updateWarehouseCoverage<T>(payload: { warehouseId: number; urbanId: Array<number>; deletedUrbanId: Array<number>; }): Observable<T> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<T>(this._url + `/${payload.warehouseId}`, payload);
    }

}
