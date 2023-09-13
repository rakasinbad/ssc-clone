import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PaginateResponse } from '../models/global.model';
import { InvoiceGroup } from '../models/invoice-group.model';
import { IQueryParams } from '../models/query.model';
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
    private _urlInvoiceStore: string;


    /**
     *
     *
     * @private
     * @memberof InvoiceGroupApiService
     */
    private readonly _endpoint = '/invoice-groups';
    private readonly _endpointInvoice = '/invoice-groups-warehouse'
    /**
     * Creates an instance of InvoiceGroupApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof InvoiceGroupApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        this._urlInvoiceStore = this._$helper.handleApiRouter(this._endpointInvoice);
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

     /**
     *
     *
     * @param {IQueryParams} params
     * @param {string} [supplierId]
     * @returns {(Observable<Array<InvoiceGroup> | PaginateResponse<InvoiceGroup>>)}
     * @memberof InvoiceGroupApiService
     */
     findByWhSupplier(
        params,
        supplierId?: string
    ): Observable<Array<InvoiceGroup> | PaginateResponse<InvoiceGroup>> {
        let newParams = {};
        if (params.warehouseId) {
            newParams = {
                warehouseId: Number(params.warehouseId),
                supplierId: supplierId,
                paginate: false
            }
        }

        return this.http.get<Array<InvoiceGroup> | PaginateResponse<InvoiceGroup>>(this._urlInvoiceStore, {
            params: newParams
        });
    }
}