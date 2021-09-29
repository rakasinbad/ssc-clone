import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { ITotalReturnModel, IReturnDetail, IReturnLine } from '../models';

export interface IReturnApiService {
    findAll(params: IQueryParams, supplierId: string): Observable<any>;
    getTotal(params: IQueryParams, supplierId: string): Observable<ITotalReturnModel>;
    findById(id: string): Observable<IReturnDetail>;
}

interface ListApiResponse {
    skip: number;
    limit: number;
    total: number;
    data: Array<IReturnLine>;
}

@Injectable({
    providedIn: 'root'
})
export class ReturnApiService implements IReturnApiService {

    private readonly _returnUrl;
    private readonly _returnDetailUrl;
    private readonly _totalReturnUrl;

    constructor(private http: HttpClient, private _$helper: HelperService) {
        const returnListEndpoint = '/return-parcels';
        const totalReturnEndpoint = '/count-returns';

        this._returnUrl = this._$helper.handleApiRouter(returnListEndpoint);
        this._returnDetailUrl = this._returnUrl;

        this._totalReturnUrl = this._$helper.handleApiRouter(totalReturnEndpoint);
    }

    findAll(params: IQueryParams, supplierId: string): Observable<ListApiResponse> {
        const httpParameters = this._$helper.handleParams(this._returnUrl, params, []);
        return this.http.get(this._returnUrl, { params: httpParameters }) as Observable<ListApiResponse>;
    }

    getTotal(params: IQueryParams, supplierId: string): Observable<ITotalReturnModel> {
        const httpParameters = this._$helper.handleParams(this._returnUrl, params, []);
        return this.http.get(this._totalReturnUrl, { params: httpParameters }) as Observable<ITotalReturnModel>;
    }

    findById(id: string): Observable<IReturnDetail> {
        return this.http.get(`${this._returnDetailUrl}/${id}`) as Observable<IReturnDetail>;
    }
}
