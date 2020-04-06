import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';

import { Store as NgRxStore } from '@ngrx/store';
import { fromFlexiComboList } from '../store/reducers';
import { FlexiComboList } from '../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { IPaginatedResponse } from 'app/shared/models/global.model';

/**
 *
 *
 * @export
 * @class FlexiComboListApiService
 */
@Injectable({
    providedIn: 'root'
})
export class FlexiComboListApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof FlexiComboListApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof FlexiComboListApiService
     */
    private readonly _FlexiComboEndpoint = '/sku-assignment?type=sku';

    /**
     * Creates an instance of FlexiComboListApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof FlexiComboListApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._FlexiComboEndpoint);
    }

    findFlexiCombo(params: IQueryParams): Observable<IPaginatedResponse<FlexiComboList>> {
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

        this._url = this._$helper.handleApiRouter(this._FlexiComboEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<IPaginatedResponse<FlexiComboList>>(this._url, {
            params: newParams
        });
    }
}
