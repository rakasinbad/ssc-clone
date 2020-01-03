import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import { IAssociation } from '../models';

/**
 *
 *
 * @export
 * @class AssociationApiService
 */
@Injectable({
    providedIn: 'root'
})
export class AssociationApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof AssociationApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof AssociationApiService
     */
    private readonly _endpoint = '/portfolios';

    /**
     * Creates an instance of AssociationApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof AssociationApiService
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

        if (params['associated']) {
            newArg.push({
                key: 'associated',
                value: 'true'
            });
        } else if (params.hasOwnProperty('associated') && !params['associated']) {
            newArg.push({
                key: 'associated',
                value: 'false'
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    findById(id: string, supplierId?: string): Observable<IAssociation> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<IAssociation>(`${this._url}/${id}`, { params: newParams });
    }

    create<T>(body: T): Observable<IAssociation> {
        return this.http.post<IAssociation>(this._url, body);
    }
}
