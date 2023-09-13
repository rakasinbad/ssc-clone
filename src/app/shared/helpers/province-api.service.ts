import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PaginateResponse } from '../models/global.model';
import { IProvince } from '../models/location.model';
import { IQueryParams } from '../models/query.model';
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

    findAll(params: IQueryParams): Observable<Array<IProvince> | PaginateResponse<IProvince>> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<Array<IProvince> | PaginateResponse<IProvince>>(this._url, {
            params: newParams, 
            headers: {
                "X-Replica": "true",
            }
        });
    }

    findAllDropdown(params: IQueryParams): Observable<IProvince[]> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IProvince[]>(this._url, { params: newParams, headers: {
            "X-Replica": "true",
        } });
    }
}
