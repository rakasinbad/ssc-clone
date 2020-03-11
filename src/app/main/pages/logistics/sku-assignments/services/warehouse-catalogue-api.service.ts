import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';

import { Store as NgRxStore } from '@ngrx/store';
import { fromSkuAssignments } from '../store/reducers';
import { SkuAssignmentsWarehouse } from '../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { IPaginatedResponse } from 'app/shared/models/global.model';

/**
 *
 *
 * @export
 * @class WarehouseCatalogueApiService
 */
@Injectable({
    providedIn: 'root'
})
export class WarehouseCatalogueApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof WarehouseCatalogueApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof WarehouseCatalogueApiService
     */
    private readonly _endpoint = '/warehouse-catalogues';

    /**
     * Creates an instance of WarehouseCatalogueApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof WarehouseCatalogueApiService
     */
    constructor(
        private http: HttpClient,
        private _$helper: HelperService,
        private portfolioStore: NgRxStore<fromSkuAssignments.SkuAssignmentsState>
    ) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!isNaN(params['warehouseId'])) {
            newArgs.push({ key: 'warehouseId', value: params['warehouseId'] });
        } else {
            throw new Error('warehouseId is required.');
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, {
            params: newParams
        });
    }
}
