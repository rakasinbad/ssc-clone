import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams, IPaginatedResponse } from 'app/shared/models';
import { Observable } from 'rxjs';

import { Store as Merchant } from '../models';

@Injectable({
    providedIn: 'root'
})
export class MerchantApiService {
    private _url: string;
    private readonly _endpoint = '/stores';

    constructor(private http: HttpClient, private helperSvc: HelperService) {
        this._url = helperSvc.handleApiRouter(this._endpoint);
    }
    
    find(params: IQueryParams): Observable<Array<Merchant> | IPaginatedResponse<Merchant>> {
        this._url = this.helperSvc.handleApiRouter(this._endpoint);
        const newParams = this.helperSvc.handleParams(this._url, params);

        if (params.paginate) {
            return this.http.get<IPaginatedResponse<Merchant>>(this._url, { params: newParams });
        } else {
            return this.http.get<Array<Merchant>>(this._url, { params: newParams });
        }
    }

    findById(id: string): Observable<Merchant> {
        return this.http.get<Merchant>(`${this._url}/${id}`);
    }
}
