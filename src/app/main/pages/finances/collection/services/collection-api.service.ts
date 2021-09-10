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
    private _urlCalculate: string;

    private readonly _endpointCollection = '/collection/v1';
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpointCollection);
        this._urlCalculate = this._$helper.handleApiRouter(this._endpointCollection);
    }

    getCollectionStatusType<T>(type: number, supplierId?: string): Observable<T> {
        const newArg =
            supplierId && type
                ? [
                      {
                          key: 'supplierId',
                          value: supplierId,
                      },
                      {
                          key: 'type',
                          value: type,
                      },
                  ]
                : [];

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);
        
        return this.http.get<T>(this._urlCalculate + '/available-collection-status', { params: newParams });
    }

    findAllCollection<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        this._url = this._$helper.handleApiRouter(
            this._endpointCollection + '/web/payment-methods'
        );
        console.log('masuk sini iqueryparams->', params);
        const newArg = [];

        if (!supplierId && !supplierId) {
            throw new Error('ERR_COLLECTION_REQUIRED_SUPPLIERID');
        }

        if (supplierId && !supplierId) {
            newArg.push({ key: 'supplierId', value: supplierId });
        }

        if (params['keyword']) {
            newArg.push({ key: 'keyword', value: params['keyword'] });
        }

        if (params['skip'] > 0) {
            newArg.push({ key: 'skip', value: params.skip });
        }

        if (params['skip'] == 0) {
            newArg.push({ key: 'skip', value: '0' });
        }

        if (params['limit']) {
            newArg.push({ key: 'limit', value: params.limit });
        }

        if (params['searchBy']) {
            newArg.push({ key: 'searchBy', value: params['payload']['searchBy'] });
        }

        if (params['approvalStatus']) {
            newArg.push({ key: 'approvalStatus', value: params['payload']['approvalStatus'] });
        }

        // approvalStatus=approved
        // searchBy=supplierName&keyword=Tigaraksa
        // searchBy=supplierName&keyword=Tigaraksa&approvalStatus=approved

        console.log('newArg->', newArg)
        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
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

    // findById(id: string, type = 'order'): Observable<any> {
    //     if (type === 'invoice') {
    //         this._url = this._$helper.handleApiRouter('/payment/v1/invoice');
    //     } else {
    //         this._url = this._$helper.handleApiRouter(this._endpointCollection);
    //     }
    //     return this.http.get(`${this._url}/${id}`);
    // }

    //get data detail
    findById(id): Observable<any> {
        this._url = this._$helper.handleApiRouter(
            this._endpointCollection + '/web/payment-methods'
        );

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
