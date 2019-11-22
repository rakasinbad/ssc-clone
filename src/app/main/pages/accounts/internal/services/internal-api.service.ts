import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams, UserSupplier, UserSupplierOptions } from 'app/shared/models';
import { Observable } from 'rxjs';

import { IInternalEmployeeDetail, InternalEmployeeDetail } from '../models';

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
    private readonly _endpoint = '/user-suppliers';

    private readonly _endpointEmployeeDetail = '/users';

    /**
     * Creates an instance of InternalApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof InternalApiService
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

    findById(userId: string): Observable<IInternalEmployeeDetail> {
        this._url = this._$helper.handleApiRouter(this._endpointEmployeeDetail);
        return this.http.get<IInternalEmployeeDetail>(`${this._url}/${userId}`);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @returns {Observable<UserSupplier>}
     * @memberof InternalApiService
     */
    create<T>(body: T): Observable<UserSupplier> {
        return this.http.post<UserSupplier>(this._url, body);
    }

    /**
     *
     *
     * @param {UserSupplierOptions} body
     * @param {string} id
     * @returns {Observable<UserSupplier>}
     * @memberof InternalApiService
     */
    patch(body: UserSupplierOptions, id: string): Observable<UserSupplier> {
        return this.http.patch<UserSupplier>(`${this._url}/${id}`, body);
    }

    updatePatch(body: InternalEmployeeDetail, id: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpointEmployeeDetail);
        return this.http.patch<any>(`${this._url}/${id}`, body);
    }

    updatePatchStatusInternalEmployee(body: { status: string }, id: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<any>(`${this._url}/${id}`, body);
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<UserSupplier>}
     * @memberof InternalApiService
     */
    delete(id: string): Observable<UserSupplier> {
        return this.http.delete<UserSupplier>(`${this._url}/${id}`);
    }
}