import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { InvoiceGroup, IQueryParams, PaginateResponse } from '../models';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class InvoiceGroupApiService
 */
@Injectable({
    providedIn: 'root'
})
export class InvoiceGroupApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof InvoiceGroupApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof InvoiceGroupApiService
     */
    private readonly _endpoint = '/invoice-groups';

    /**
     * Creates an instance of InvoiceGroupApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof InvoiceGroupApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @param {string} [supplierId]
     * @returns {(Observable<Array<InvoiceGroup> | PaginateResponse<InvoiceGroup>>)}
     * @memberof InvoiceGroupApiService
     */
    findAll(
        params: IQueryParams,
        supplierId?: string
    ): Observable<Array<InvoiceGroup> | PaginateResponse<InvoiceGroup>> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<Array<InvoiceGroup> | PaginateResponse<InvoiceGroup>>(this._url, {
            params: newParams
        });
    }
}
