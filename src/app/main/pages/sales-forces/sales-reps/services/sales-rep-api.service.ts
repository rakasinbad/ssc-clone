import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class SalesRepApiService
 */
@Injectable({
    providedIn: 'root'
})
export class SalesRepApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof SalesRepApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof SalesRepApiService
     */
    private readonly _endpoint = '/sales-reps';

    /**
     * Creates an instance of SalesRepApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof SalesRepApiService
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
}
