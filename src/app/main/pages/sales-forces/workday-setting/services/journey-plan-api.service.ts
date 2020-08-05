import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { JourneyPlan } from '../models';

/**
 *
 *
 * @export
 * @class JourneyPlanApiService
 */
@Injectable({
    providedIn: 'root'
})
export class JourneyPlanApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof JourneyPlanApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof JourneyPlanApiService
     */
    private readonly _endpoint = '/journey-plans';

    /**
     * Creates an instance of JourneyPlanApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof JourneyPlanApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findAll<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    delete(id: string): Observable<JourneyPlan> {
        return this.http.delete<JourneyPlan>(`${this._url}/${id}`);
    }
}
