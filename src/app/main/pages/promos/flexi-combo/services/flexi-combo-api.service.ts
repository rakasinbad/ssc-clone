import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { FlexiCombo } from '../models';
import { fromFlexiCombo } from '../store/reducers';

/**
 *
 *
 * @export
 * @class FlexiComboApiService
 */
@Injectable({
    providedIn: 'root'
})
export class FlexiComboApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof FlexiComboApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof FlexiComboApiService
     */
    private readonly _FlexiComboEndpoint = '/sku-assignment';

    /**
     * Creates an instance of FlexiComboApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof FlexiComboApiService
     */
    constructor(
        private http: HttpClient,
        private _$helper: HelperService,
        private portfolioStore: NgRxStore<fromFlexiCombo.FlexiComboState>
    ) {
        this._url = this._$helper.handleApiRouter(this._FlexiComboEndpoint);
    }

    findFlexiCombo(params: IQueryParams): Observable<FlexiCombo> {
        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        this._url = this._$helper.handleApiRouter(this._FlexiComboEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<FlexiCombo>(this._url, { params: newParams });
    }

    addFlexiCombo<T, R>(payload: T): Observable<R> {
        this._url = this._$helper.handleApiRouter(this._FlexiComboEndpoint);
        return this.http.post<R>(this._url, payload);
    }
}
