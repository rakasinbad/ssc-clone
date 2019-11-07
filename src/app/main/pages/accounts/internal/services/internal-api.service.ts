import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import {
    IInternalEmployee,
    IInternalEmployeeDetail,
    IInternalEmployeeResponse,
    InternalEmployeeDetail
} from '../models';

/**
 *
 *
 * @export
 * @class InternalApiService
 */
@Injectable({
    providedIn: 'root'
})
export class InternalApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof InternalApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof InternalApiService
     */
    private readonly _endpoint = '/user-brands';

    private readonly _endpointEmployeeDetail = '/users';

    /**
     * Creates an instance of InternalApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof InternalApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {}

    /**
     *
     *
     * @param {IQueryParams} params
     * @param {string} [brandId]
     * @returns {Observable<IInternalEmployee>}
     * @memberof InternalApiService
     */
    findAll(params: IQueryParams, brandId?: string): Observable<IInternalEmployeeResponse> {
        const newArg = brandId
            ? [
                  {
                      key: 'brandId',
                      value: brandId
                  }
              ]
            : null;

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, newArg);

        return this.http.get<IInternalEmployeeResponse>(this._url, { params: newParams });
    }

    findById(userId: string): Observable<IInternalEmployeeDetail> {
        this._url = this._$helper.handleApiRouter(this._endpointEmployeeDetail);
        return this.http.get<IInternalEmployeeDetail>(`${this._url}/${userId}`);
    }

    updatePatch(body: InternalEmployeeDetail, id: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointEmployeeDetail);
        return this.http.patch<any>(`${this._url}/${id}`, body);
    }

    updatePatchStatusInternalEmployee(body: { status: string }, id: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<any>(`${this._url}/${id}`, body);
    }

    delete(id: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.delete<any>(`${this._url}/${id}`);
    }
}
