import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CreditLimitBalanceApiService {
    private _url: string;
    private readonly _endpoint = '/brand-stores';
    private readonly _endpointGroup = '/credit-limit-groups';

    constructor(private http: HttpClient, private _$helper: HelperService) {}

    findAllGroup(params: IQueryParams, brandId?: string): Observable<any> {
        const newArg = brandId
            ? [
                  {
                      key: 'brandId',
                      value: brandId
                  }
              ]
            : null;

        this._url = this._$helper.handleApiRouter(this._endpointGroup);
        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get(this._url, { params: newParams });
    }
}
