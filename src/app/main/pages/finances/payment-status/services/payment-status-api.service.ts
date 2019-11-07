import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PaymentStatusApiService {
    private _url: string;
    private readonly _endpoint = '/order-parcels';

    constructor(private http: HttpClient, private _$helper: HelperService) {}

    findAll(params: IQueryParams, brandId?: string): Observable<any> {
        const newArg = brandId
            ? [
                  {
                      key: 'brandId',
                      value: brandId
                  },
                  {
                      key: 'type',
                      value: 'payment'
                  }
              ]
            : [
                  {
                      key: 'type',
                      value: 'payment'
                  }
              ];
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get(this._url, { params: newParams });
    }
}
