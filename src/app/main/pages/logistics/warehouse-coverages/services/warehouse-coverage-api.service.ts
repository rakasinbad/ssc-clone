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

        if (params['type'] !== 'covered' || params['type'] !== 'not_covered') {
            throw new Error('type only accept: covered, not_covered.');
        } else {
            newArgs.push({ key: 'type', value: params['type'] });
        }


        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(this._url, { params: newParams });
    }

    createWarehouseCoverage<T>(payload: { warehouseId: number; urbanId: Array<number>; }): Observable<T> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.post<T>(this._url, payload);
    }

}
