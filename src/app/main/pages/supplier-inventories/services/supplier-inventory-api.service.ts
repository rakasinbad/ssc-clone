import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SupplierInventoryApiService {
    private _url: string;
    private readonly _endpoint = '/catalogues';

    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findAll(params: IQueryParams, supplierId?: string): Observable<any> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        if (params['calculateStock']) {
            newArg.push({
                key: 'calculateStock',
                value: 'true'
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get(this._url, { params: newParams });
    }

    findById(id: string): Observable<any> {
        return this.http.get(`${this._url}/${id}`);
    }

    patchCustom<T>(body: T, id: string): Observable<any> {
        return this.http.patch(`${this._url}/${id}`, body);
    }
}
