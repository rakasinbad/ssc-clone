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
    private _urlCollectionStatus: string;
    private _urlBillingStatus: string;

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

        return this.http.get<T>(this._urlCalculate + '/available-collection-status', {
            params: newParams,
        });
    }

    findAllCollection<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        this._urlCollectionStatus = this._$helper.handleApiRouter(
            this._endpointCollection + '/web/payment-methods'
        );
        const newArg = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_COLLECTION_REQUIRED_SUPPLIERID');
        }

        if (params['supplierId'] && !params['noSupplierId']) {
            newArg.push({ key: 'supplierId', value: params['supplierId'] });
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

        if (params['keyword'] !== '') {
            newArg.push({ key: 'keyword', value: params['keyword'] });
        }

        if (params['searchBy'] && params['keyword'] !== '') {
            newArg.push({ key: 'searchBy', value: params['searchBy'] });
        }

        if (params['approvalStatus'] !== 'all') {
            newArg.push({ key: 'approvalStatus', value: params['approvalStatus'] });
        }

        const newParams = this._$helper.handleParams(this._urlCollectionStatus, params, ...newArg);
        delete newParams['paginate'];
        return this.http.get<T>(this._urlCollectionStatus, { params: newParams });
    }

    findAllBilling<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        this._urlBillingStatus = this._$helper.handleApiRouter(
            this._endpointCollection + '/web/payment-billings'
        );
        const newArg = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_BILLING_REQUIRED_SUPPLIERID');
        }

        if (params['supplierId'] && !params['noSupplierId']) {
            newArg.push({ key: 'supplierId', value: params['supplierId'] });
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

        if (params['keyword'] !== '') {
            newArg.push({ key: 'keyword', value: params['keyword'] });
        }

        if (params['searchBy'] && params['keyword'] !== '') {
            newArg.push({ key: 'searchBy', value: params['searchBy'] });
        }

        if (params['approvalStatus'] !== 'all') {
            newArg.push({ key: 'approvalStatus', value: params['approvalStatus'] });
        }

        const newParams = this._$helper.handleParams(this._urlBillingStatus, params, ...newArg);
        delete newParams['paginate'];

        return this.http.get<T>(this._urlBillingStatus, { params: newParams });
    }

    //get data detail
    findById(id): Observable<any> {
        this._url = this._$helper.handleApiRouter(
            this._endpointCollection + '/web/payment-methods'
        );

        return this.http.get(`${this._url}/${id}`);
    }
    
    // get data collection photo by id
    findCollectionPhotoById(id: number): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointCollection + '/payment-method/images');

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
