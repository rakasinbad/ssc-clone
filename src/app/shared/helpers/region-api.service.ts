import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PaginateResponse, PaginateResponseV2 } from '../models/global.model';
import { IQueryParamsRegion, Region } from '../models/region.model';
import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class RegionApiService
 */
@Injectable({
    providedIn: 'root',
})
export class RegionApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof RegionApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof RegionApiService
     */

    private readonly _endpoint = '/medeago/api/v1/ssc/regions';
    /**
     * Creates an instance of RegionApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof RegionApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @param {IQueryParamsRegion} params
     * @param {string} [supplierId]
     * @returns {(Observable<Array<Region> | PaginateResponse<Region>>)}
     * @memberof RegionApiService
     */
    findAll(params: IQueryParamsRegion, supplierId?: string): Observable<Array<Region> | PaginateResponseV2<Region>> {
        const newArg = supplierId
        ? [
              {
                  key: 'supplierId',
                  value: supplierId
              }
          ]
        : [];

        let newParams = this._$helper.handleParams(this._url, params,...newArg);
        newParams = newParams.append('page', params.page ? params.page.toString() : (1).toString());
        newParams = newParams.append(
            'perPage',
            params.perPage ? params.perPage.toString() : (10).toString()
        );

        return this.http.get<Array<Region> | PaginateResponseV2<Region>>(this._url, {
            params:newParams,
        });
    }
}
