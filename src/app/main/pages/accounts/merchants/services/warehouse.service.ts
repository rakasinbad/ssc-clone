import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { SupplierStore, SupplierStoreOptions } from 'app/shared/models/supplier.model';
import { Observable } from 'rxjs';

import { StoreSetting } from '../models';

/**
 *
 *
 * @export
 * @class WarehouseApiService
 */
@Injectable({
    providedIn: 'root'
})
export class WarehouseApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof WarehouseApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof WarehouseApiService
     */
    private readonly _endpoint = '/check-warehouse';

    /**
     * Creates an instance of WarehouseApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof WarehouseApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {}

    find<T>(supplierId: number, urbanId: number): Observable<T> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.post<T>(this._url, { supplierId, urbanId });
    }
}
