import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PaginateResponse, PaginateResponseV2 } from '../models/global.model';
import { Branch, IQueryParamsBranchTeritory } from '../models/branch.model';
import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class BranchApiService
 */
@Injectable({
    providedIn: 'root',
})
export class BranchApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof BranchApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof BranchApiService
     */

    private readonly _endpoint = '/medeago/api/v1/ssc/branches';
    /**
     * Creates an instance of BranchApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof BranchApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @param {number} [regionIds]
     * @returns {(Observable<Array<Branch> | PaginateResponse<Branch>>)}
     * @memberof BranchApiService
     */
    findAll(
        params: IQueryParams,
        regionIds: number
    ): Observable<Array<Branch> | PaginateResponse<Branch>> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<Array<Branch> | PaginateResponse<Branch>>(
            this._url + '?regionIds[]=' + regionIds,
            {
                params: newParams,
            }
        );
    }
    findByIds(
        params: Omit<IQueryParamsBranchTeritory, 'regionIds'>,
        regionIds: number[]
    ): Observable<Array<Branch> | PaginateResponseV2<Branch>> {
        let newParams = this._$helper.handleParams(this._url, params);
        newParams = newParams.append('page', params.page ? params.page.toString() : (1).toString());
        newParams = newParams.append(
            'perPage',
            params.perPage ? params.perPage.toString() : (10).toString()
        );

        if (Boolean(regionIds.length)) {
            regionIds.forEach((i) => {
                newParams = newParams.append('regionIds[]', i.toString());
            });
        }
        return this.http.get<Array<Branch> | PaginateResponseV2<Branch>>(this._url, {
            params: newParams,
        });
    }
}
