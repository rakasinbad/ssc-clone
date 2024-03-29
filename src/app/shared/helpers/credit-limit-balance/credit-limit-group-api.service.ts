import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

// import { CreditLimitGroup, CreditLimitGroupForm } from '../models';

/**
 *
 *
 * @export
 * @class CreditLimitGroupApiService
 */
@Injectable({
    providedIn: 'root'
})
export class CreditLimitGroupApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof CreditLimitGroupApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof CreditLimitGroupApiService
     */
    private readonly _endpoint = '/credit-limit-groups';

    /**
     * Creates an instance of CreditLimitGroupApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof CreditLimitGroupApiService
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
     * @memberof CreditLimitGroupApiService
     */
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

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<CreditLimitGroup>}
     * @memberof CreditLimitGroupApiService
     */
    findById(id: string): Observable<any> {
        return this.http.get<any>(`${this._url}/${id}`);
    }

    /**
     *
     *
     * @template T
     * @param {T} body
     * @returns {Observable<CreditLimitGroup>}
     * @memberof CreditLimitGroupApiService
     */
    create<T>(body: T): Observable<any> {
        return this.http.post<any>(this._url, body);
    }

    /**
     *
     *
     * @param {Partial<CreditLimitGroupForm>} body
     * @param {string} id
     * @returns {Observable<CreditLimitGroup>}
     * @memberof CreditLimitGroupApiService
     */
    patch(body: Partial<any>, id: string): Observable<any> {
        return this.http.patch<any>(`${this._url}/${id}`, body);
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<CreditLimitGroup>}
     * @memberof CreditLimitGroupApiService
     */
    delete(id: string): Observable<any> {
        return this.http.delete<any>(`${this._url}/${id}`);
    }
}
