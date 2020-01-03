import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import { IAssociationPortfolio } from '../models';

/**
 *
 *
 * @export
 * @class AssociationApiSalesRepsService
 */
@Injectable({
    providedIn: 'root'
})
export class AssociationApiSalesRepsService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof AssociationApiSalesRepsService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof AssociationApiSalesRepsService
     */
    private readonly _endpoint = '/sales-reps';

    /**
     * Creates an instance of AssociationApiSalesRepsService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof AssociationApiSalesRepsService
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

    findById(id: string, supplierId?: string): Observable<IAssociationPortfolio> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<IAssociationPortfolio>(`${this._url}/${id}`, { params: newParams });
    }

    create<T>(body: T): Observable<IAssociationPortfolio> {
        return this.http.post<IAssociationPortfolio>(this._url, body);
    }
}
