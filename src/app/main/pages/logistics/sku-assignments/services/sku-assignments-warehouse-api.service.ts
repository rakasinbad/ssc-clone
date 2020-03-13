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
 * @class SkuAssignmentsApiService
 */
@Injectable({
    providedIn: 'root'
})
export class SkuAssignmentsWarehouseApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof SkuAssignmentsApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof SkuAssignmentsApiService
     */
    private readonly _SkuAssignmentsEndpoint = '/sku-assignment?type=warehouse';

    /**
     * Creates an instance of SkuAssignmentsApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof SkuAssignmentsApiService
     */
    constructor(
        private http: HttpClient,
        private _$helper: HelperService,
        private portfolioStore: NgRxStore<fromSkuAssignments.SkuAssignmentsState>
    ) {
        this._url = this._$helper.handleApiRouter(this._SkuAssignmentsEndpoint);
    }

    findSkuAssignments(
        params: IQueryParams
    ): Observable<IPaginatedResponse<SkuAssignmentsWarehouse>> {
        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['assigned']) {
            newArgs.push({ key: 'assigned', value: params['assigned'] });
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        this._url = this._$helper.handleApiRouter(this._SkuAssignmentsEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<IPaginatedResponse<SkuAssignmentsWarehouse>>(this._url, {
            params: newParams
        });
    }
}
