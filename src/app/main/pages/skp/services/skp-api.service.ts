import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams, IQueryParamsPromoList } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { SkpModel, CreateSkpDto, UpdateSkpDto } from '../models';

/**
 *
 *
 * @export
 * @class SkpApiService
 */
@Injectable({
    providedIn: 'root',
})
export class SkpApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof SkpApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof SkpApiService
     */
    private readonly _endpoint = '/SKP';

    /**
     * Creates an instance of SkpApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof SkpApiService
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
     * @memberof SkpApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (params['keyword']) {
            newArg.push({
                key: 'keyword',
                value: params['keyword'],
            });
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @template T
     * @param {string} id
     * @param {IQueryParams} [params]
     * @returns {Observable<T>}
     * @memberof SkpApiService
     */
    findById<T>(id: string, params?: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['supplierId']) {
            newArg.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (params['data']) {
            newArg.push({
                key: 'data',
                value: params['data'],
            });
        }

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<T>(`${this._url}/${id}`, { params: newParams });
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @returns {Observable<T>}
     * @memberof SkpApiService
     */
    findDetailList<T>(params?: IQueryParamsPromoList): Observable<T> {
        const newArg = [];

        // if (params['supplierId']) {
        //     newArg.push({
        //         key: 'supplierId',
        //         value: params['supplierId'],
        //     });
        // }

        if (params['data']) {
            newArg.push({
                key: 'data',
                value: params['data'],
            });
        }

        // if (type== 'promo'){
            if (params['promo_limit']) {
                newArg.push({
                    key: 'promo_limit',
                    value: params['promo_limit'],
                });
            }
            if (params['promo_skip']) {
                newArg.push({
                    key: 'promo_skip',
                    value: params['promo_skip'],
                });
            }
        // } else {

        // }

        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<T>(`${this._url}/${1}`, { params: newParams });
    }

    create<T>(body: T): Observable<CreateSkpDto> {
        return this.http.post<CreateSkpDto>(this._url, body);
    }

    patch<T>(body: T, id: string): Observable<UpdateSkpDto> {
        return this.http.patch<UpdateSkpDto>(`${this._url}/${id}`, body);
    }

    put<T>(body: T, id: string): Observable<SkpModel> {
        return this.http.put<SkpModel>(`${this._url}/${id}`, body);
    }

    delete(id: string): Observable<SkpModel> {
        return this.http.delete<SkpModel>(`${this._url}/${id}`);
    }
}
