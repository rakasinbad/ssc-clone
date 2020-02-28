import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams, IPaginatedResponse } from 'app/shared/models';
import { Observable } from 'rxjs';

import { Store as NgRxStore } from '@ngrx/store';
import { fromSkuAssignments } from '../store/reducers';
import { SkuAssignmentsSku } from '../models';

/**
 *
 *
 * @export
 * @class SkuAssignmentsApiService
 */
@Injectable({
    providedIn: 'root'
})
export class SkuAssignmentsSkuApiService {
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
    private readonly _SkuAssignmentsEndpoint = '/sku-assignment?type=sku';

    /**
     * Creates an instance of SkuAssignmentsApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof SkuAssignmentsApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._SkuAssignmentsEndpoint);
    }

    findSkuAssignments(params: IQueryParams): Observable<IPaginatedResponse<SkuAssignmentsSku>> {
        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (params['assigned']) {
            newArgs.push({ key: 'assigned', value: params['assigned'] });
        }

        this._url = this._$helper.handleApiRouter(this._SkuAssignmentsEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<IPaginatedResponse<SkuAssignmentsSku>>(this._url, {
            params: newParams
        });
    }
}
