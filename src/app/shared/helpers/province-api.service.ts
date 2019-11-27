import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IProvince, IProvinceResponse, IQueryParams, Province, PaginateResponse } from '../models';
import { HelperService } from './helper.service';

@Injectable({
    providedIn: 'root'
})
export class ProvinceApiService {
    private _url: string;
    private readonly _endpoint = '/provinces';

    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findAll(params: IQueryParams): Observable<Array<Province> | PaginateResponse<Province>> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<Array<Province> | PaginateResponse<Province>>(this._url, {
            params: newParams
        });
    }

    findAllDropdown(params: IQueryParams): Observable<IProvince[]> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IProvince[]>(this._url, { params: newParams });
    }
}
