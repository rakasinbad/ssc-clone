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

    /**
     *
     *
     * @param {IQueryParams} params
     * @param {string} [supplierId]
     * @returns {Observable<any>}
     * @memberof OrderApiService
     */
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
}
