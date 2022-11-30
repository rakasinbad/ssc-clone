import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { ITotalReturnModel, IReturnDetail, IReturnLine, IReturnAmount } from '../models';
import { IChangeStatusReturn } from '../models/returndetail.model';

export interface IReturnApiService {
    findAll(params: IQueryParams, supplierId: string): Observable<any>;
    getTotal(params: IQueryParams, supplierId: string): Observable<ITotalReturnModel>;
    findById(id: string): Observable<IReturnDetail>;

    update(id: string, changes: Partial<IReturnDetail>): Observable<any>;
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
    private readonly _returnAmountUrl;

    constructor(private http: HttpClient, private _$helper: HelperService) {
        const returnListEndpoint = '/return-parcels';
        const totalReturnEndpoint = '/count-returns';
        const returnParcelDetail = '/return-parcel-detail';

        this._returnUrl = this._$helper.handleApiRouter(returnListEndpoint);
        this._returnDetailUrl = this._$helper.handleApiRouter(returnParcelDetail);

        this._totalReturnUrl = this._$helper.handleApiRouter(totalReturnEndpoint);
        this._returnAmountUrl = this._$helper.handleApiRouter('/return-amount-detail');
    }

    findAll(params: IQueryParams, supplierId: string): Observable<ListApiResponse> {
        const args = supplierId
            ? [
                {
                    key: 'supplierId',
                    value: supplierId
                }
            ]
            : [];

        const httpParameters = this._$helper.handleParams(this._returnUrl, params, ...args);
        return this.http.get(this._returnUrl, { params: httpParameters }) as Observable<ListApiResponse>;
    }

    getTotal(params: IQueryParams, supplierId: string): Observable<ITotalReturnModel> {
        const args = supplierId
            ? [
                {
                    key: 'supplierId',
                    value: supplierId
                }
            ]
            : [];

        const httpParameters = this._$helper.handleParams(this._returnUrl, params, ...args);
        return this.http.get(this._totalReturnUrl, { params: httpParameters }) as Observable<ITotalReturnModel>;
    }

    findById(id: string): Observable<IReturnDetail> {
        return this.http.get(`${this._returnDetailUrl}/${id}`) as Observable<IReturnDetail>;
    }

    update(id: string, changes: IChangeStatusReturn): Observable<any> {
        return this.http.patch(`${this._returnUrl}/${id}`, changes);
    }

    getReturnAmount(id: string | number): Observable<IReturnAmount> {
        return this.http.get(`${this._returnAmountUrl}/${id}`) as Observable<IReturnAmount>;
    }
}
