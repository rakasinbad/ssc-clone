import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class SupplierStoresApiService
 */
@Injectable({
    providedIn: 'root'
})
export class SupplierStoresApiService {
    private _url: string;
    private readonly _endpoint = '/supplier-stores';
    private readonly _endpointPromo = '/get-segmentation-promo';
    private readonly _endpointMass = '/mass-upload';

    constructor(
        private http: HttpClient,
        private helper$: HelperService,
    ) {}

    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_SUPPLIER_STORES_REQUIRED_SUPPLIERID');
        }
        
        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        this._url = this.helper$.handleApiRouter(this._endpoint);
        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(this._url, { params: newParams });
    }

    findSegmentPromo<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!params['supplierId'] && !params['noSupplierId']) {
            throw new Error('ERR_WAREHOUSE_REQUIRES_SUPPLIERID');
        }
        
        if (params['supplierId'] && !params['noSupplierId']) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['catalogueId']) {
            newArgs.push({ key: 'catalogueId', value: params['catalogueId'] });
        }

        if (params['brandId']) {
            newArgs.push({ key: 'brandId', value: params['brandId'] });
        }

        if (params['fakturId']) {
            newArgs.push({ key: 'fakturId', value: params['fakturId'] });
        }

        if (params['catalogueSegmentationId']) {
            newArgs.push({ key: 'catalogueSegmentationId', value: params['catalogueSegmentationId'] });
        }
        
        if (params['segment']) {
            newArgs.push({ key: 'segment', value: params['segment'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        this._url = this.helper$.handleApiRouter(this._endpointPromo);
        const newParams = this.helper$.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    uploadMassStore(payload, files: File): Observable<any> {
        console.log('isi payload upmass1->', payload)
        // payload.file = payload.file.name;
        let formData = new FormData();
        formData.append('file', files, files.name);
        formData.append('type', payload.type);
        formData.append('supplierId', payload.supplierId);
        formData.append('catalogueId', payload.catalogueId);
        // let headers = new Headers();

        // for(var pair of formData.entries()) {
        //     console.log(pair[0]+', '+pair[1]);
        //   }
      
        // console.log('formData upmass->', formData.entries())
        // /** In Angular 5, including the header Content-Type can invalidate your request */
        // headers.append('Content-Type', 'multipart/form-data');
        // headers.append('Accept', 'application/json');
        // let options = new RequestOptions({ headers: headers });
        // return this.http.post(url, formData, options)

        return this.http.post(this._endpointMass, formData, {
            reportProgress: true
        });
    }

    uploadFormData(formData: FormData): Observable<any> {
        // const headers = new HttpHeaders().append('Content-Type', undefined);
        // const headers = new HttpHeaders().append('Content-Type', 'multipart/form-data');
        this._url = this.helper$.handleApiRouter(this._endpointMass);
        return this.http.post(`${this._url}`, formData, {
            reportProgress: true
        });
    }

}
