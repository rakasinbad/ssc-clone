import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class JourneyPlanStoreApiService
 */
@Injectable({
    providedIn: 'root'
})
export class JourneyPlanStoreApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof JourneyPlanStoreApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof JourneyPlanStoreApiService
     */
    private readonly _endpoint = '/store-portfolio-lists';

    /**
     * Creates an instance of JourneyPlanStoreApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof JourneyPlanStoreApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @param {string} [supplierId]
     * @returns {Observable<T>}
     * @memberof JourneyPlanStoreApiService
     */
    findAll<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        let oldParams = params;

        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        if (params.search && params.search.length > 0) {
            const idx = params.search.findIndex(r => r.fieldName === 'invoiceGroupId');

            if (idx !== -1) {
                if (newArg && newArg.length > 0) {
                    newArg[idx] = {
                        key: 'invoiceGroupId',
                        value: params.search[idx].keyword as string
                    };
                } else {
                    if (Array.isArray(newArg)) {
                        newArg[0] = {
                            key: 'invoiceGroupId',
                            value: params.search[0].keyword as string
                        };
                    }
                }

                oldParams = {
                    ...params,
                    search: params.search.filter(r => r.fieldName !== 'invoiceGroupId')
                };
            }
        }

        const newParams = this._$helper.handleParams(this._url, oldParams, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
