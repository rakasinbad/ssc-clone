import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams, SupplierStore, SupplierStoreOptions } from 'app/shared/models';
import { Observable } from 'rxjs';
import { Export } from '../models';

/**
 *
 *
 * @export
 * @class ExportsApiService
 */
@Injectable({
    providedIn: 'root'
})
export class ExportsApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof ExportsApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof ExportsApiService
     */
    private readonly _endpoint = '/export-logs';

    /**
     * Creates an instance of ExportsApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof ExportsApiService
     */
    constructor(
        private http: HttpClient,
        private helperSvc: HelperService
    ) {}

    findExportLogs<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (params['userId']) {
            newArgs.push({
                key: 'userId',
                value: params['userId']
            });
        }
        
        this._url = this.helperSvc.handleApiRouter(this._endpoint);
        const newParams = this.helperSvc.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    // requestExport(body: Partial<StoreSetting>): Observable<StoreSetting> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     return this.http.post<StoreSetting>(this._url, body);
    // }

    // patch<T>(body: SupplierStoreOptions, id: string): Observable<T> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     return this.http.patch<T>(`${this._url}/${id}`, body);
    // }

    // delete<T>(id: string): Observable<T> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     return this.http.delete<T>(`${this._url}/${id}`);
    // }

    // getStoreSetting(id: string): Observable<StoreSetting> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     return this.http.get<StoreSetting>(`${this._url}/${id}`);
    // }
}
