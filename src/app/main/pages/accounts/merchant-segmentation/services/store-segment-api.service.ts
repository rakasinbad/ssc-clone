import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StoreSegmentApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreSegmentApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreSegmentApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreSegmentApiService
     */
    private readonly _endpoint = '/segmentation-list';

    /**
     * Creates an instance of StoreSegmentApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreSegmentApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @returns {Observable<T>}
     * @memberof StoreSegmentApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (params['type']) {
            newArg.push({
                key: 'type',
                value: params['type']
            });
        }

        if (params['keyword']) {
            newArg.push({
                key: 'keyword',
                value: params['keyword']
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
