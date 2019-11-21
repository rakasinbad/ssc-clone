import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof OrderApiService
     */
    private readonly _endpoint = '/order-parcels';

    /**
     * Creates an instance of OrderApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof OrderApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findAll(params: IQueryParams, supplierId?: string): Observable<any> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get(this._url, { params: newParams });
    }

    findById(id: string): Observable<any> {
        return this.http.get(`${this._url}/${id}`);
    }

    patch(body: any, id: string): Observable<any> {
        return this.http.patch(`${this._url}/${id}`, body);
    }

    patchCustom<T>(body: T, id: string): Observable<any> {
        return this.http.patch(`${this._url}/${id}`, body);
    }
}
