import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IProvince, IProvinceResponse, IQueryParams } from '../models';
import { HelperService } from './helper.service';

@Injectable({
    providedIn: 'root'
})
export class ProvinceApiService {
    private _url: string;
    private readonly _endpoint = '/provinces';

    constructor(private http: HttpClient, private _$helper: HelperService) {}

    findAll(params: IQueryParams): Observable<IProvinceResponse[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IProvinceResponse[]>(this._url, { params: newParams });
    }

    findAllDropdown(params: IQueryParams): Observable<IProvince[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IProvince[]>(this._url, { params: newParams });
    }
}
