import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { IAssociationStore } from '../models';

/**
 *
 *
 * @export
 * @class AssociationStoreApiService
 */
@Injectable({
    providedIn: 'root'
})
export class AssociationStoreApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof AssociationStoreApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof AssociationStoreApiService
     */
    private readonly _endpoint = '/store-portfolio-lists';

    /**
     * Creates an instance of AssociationStoreApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof AssociationStoreApiService
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

        if (params['portfolio'] !== undefined && params['associated'] !== undefined) {
            newArg.push(
                {
                    key: 'portfolio',
                    value: params['portfolio']
                },
                {
                    key: 'associated',
                    value: params['associated']
                }
            );
        } else {
            newArg.push({
                key: 'portfolio',
                value: params['portfolio']
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    findById(id: string, supplierId?: string): Observable<IAssociationStore> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<IAssociationStore>(`${this._url}/${id}`, { params: newParams });
    }

    create<T>(body: T): Observable<IAssociationStore> {
        return this.http.post<IAssociationStore>(this._url, body);
    }
}
