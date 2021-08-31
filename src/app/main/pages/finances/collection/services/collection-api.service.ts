import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { options } from 'numeral';
import { Observable } from 'rxjs';

export interface IAPIOptions {
    header_X_Type: string;
}

@Injectable({
    providedIn: 'root',
})
export class CollectionApiService {
    private _url: string;
    private readonly _endpointCollection = '/collection/v1';

    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpointCollection);
    }

    getCollectionStatusType<T>(type: string, supplierId?: string): Observable<T> {
      const newArg =
          supplierId && type
              ? [
                    {
                        key: 'supplierId',
                        value: supplierId
                    },
                    {
                        key: 'type',
                        value: type
                    }
                ]
              : [];

      const newParams = this._$helper.handleParams(this._url + '/available-collection-status', null, ...newArg);

      return this.http.get<T>(this._url, { params: newParams });
  }

    findAllCollection(params: IQueryParams, supplierId?: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointCollection + '/web/payment-method');
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId,
                  },
              ]
            : [];

            // approvalStatus=approved
            // searchBy=supplierName&keyword=Tigaraksa
            // searchBy=supplierName&keyword=Tigaraksa&approvalStatus=approved

        const newParams = this._$helper.handleParamsV2(this._url, params, ...newArg);

        return this.http.get(this._url, { params: newParams });
    }

    findAllBilling(params: IQueryParams, supplierId?: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointCollection);
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId,
                  },
              ]
            : [];

        const newParams = this._$helper.handleParamsV2(this._url, params, ...newArg);

        return this.http.get(this._url, { params: newParams });
    }

    findById(id: string, type = 'order'): Observable<any> {
        if (type === 'invoice') {
            this._url = this._$helper.handleApiRouter('/payment/v1/invoice');
        } else {
            this._url = this._$helper.handleApiRouter(this._endpointCollection);
        }
        return this.http.get(`${this._url}/${id}`);
    }

    patch(body: any, id: string, opts?: IAPIOptions): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointCollection);

        let headers: HttpHeaders;

        if (opts.header_X_Type) {
            headers = new HttpHeaders({
                'X-Type': opts.header_X_Type,
            });
        }

        return this.http.patch(`${this._url}/${id}`, body, { headers });
    }
}
