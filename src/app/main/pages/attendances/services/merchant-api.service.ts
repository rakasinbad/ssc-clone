import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';
import { HelperService } from 'app/shared/helpers';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

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

        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        const newParams = this.helperSvc.handleParams(this._url, params, ...newArgs);

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
