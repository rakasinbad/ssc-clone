import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class FlexiComboApiService
 */
@Injectable({
    providedIn: 'root',
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
    private readonly _endpoint = '/flexi-promo';

    /**
     * Creates an instance of FlexiComboApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof FlexiComboApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @returns {Observable<T>}
     * @memberof FlexiComboApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (params['keyword']) {
            newArg.push({
                key: 'keyword',
                value: params['keyword'],
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
