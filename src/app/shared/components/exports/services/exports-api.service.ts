import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { ExportConfiguration } from '../models';

// import { ExportModuleNames } from '../store/actions/exports.actions';

/**
 *
 *
 * @export
 * @class ExportsApiService
 */
@Injectable({
    providedIn: 'root',
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
    private readonly _exportEndpoint = '/download/export-';

    /**
     *
     *
     * @private
     * @memberof ExportsApiService
     */
    private readonly _exportLogsEndpoint = '/export-logs';

    /**
     * Creates an instance of ExportsApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof ExportsApiService
     */
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    findExportLogs<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (params['userId']) {
            newArgs.push({
                key: 'userId',
                value: params['userId'],
            });
        }

        if (params['keyword']) {
            newArgs.push({
                key: 'keyword',
                value: params['keyword'],
            });
        }

        if (params['page']) {
            newArgs.push({
                key: 'page',
                value: params['page'],
            });
        }
        this._url = this.helperSvc.handleApiRouter(this._exportLogsEndpoint);
        const newParams = this.helperSvc.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    requestExport(params: IQueryParams): Observable<{ message: string }> {
        const newArgs = [];

        switch (params['page'] as ExportConfiguration['page']) {
            case 'stores':
                params['page'] = 'stores';
                break;

            case 'catalogues':
                params['page'] = 'catalogues';
                break;

            case 'payments':
                params['page'] = 'payments';
                break;

            case 'orders':
                params['page'] = 'orders';
                break;

            case 'portfolios':
                params['page'] = 'portfolios';
                break;

            case 'sales-rep':
                params['page'] = 'sales-rep';
                break;

            case 'journey-plans':
                params['page'] = 'journey-plans';
                break;

            case 'warehouses':
                params['page'] = 'warehouses';
                break;

            default: {
                const err: ErrorHandler = {
                    id: 'ERR_EXPORT_PAGE_TYPE_UNRECOGNIZED',
                    errors: params,
                };

                throw new ErrorHandler(err);
            }
        }

        if (params['supplierId']) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (params['status']) {
            newArgs.push({
                key: 'status',
                value: params['status'],
            });
        }

        if (params['type']) {
            newArgs.push({
                key: 'type',
                value: params['type'],
            });
        }

        if (params['warehouse']) {
            params['warehouse'].forEach((warehouseValue) => {
                newArgs.push({
                    key: 'warehouseIds[]',
                    value: warehouseValue.id,
                });
            });
        }

        if (params['page'] !== 'catalogues'){
            if (params['dateGte']) {
                newArgs.push({
                    key: 'dateGte',
                    value: params['dateGte'],
                });
            } else {
                newArgs.push({
                    key: 'dateGte',
                    value: '',
                });
            }
    
            if (params['dateLte']) {
                newArgs.push({
                    key: 'dateLte',
                    value: params['dateLte'],
                });
            } else {
                newArgs.push({
                    key: 'dateLte',
                    value: '',
                });
            }
        }

        this._url = this.helperSvc.handleApiRouter(this._exportEndpoint + params['page']);
        const newParams = this.helperSvc.handleParams(this._url, params, ...newArgs);

        return this.http.get<{ message: string }>(this._url, { params: newParams });
    }

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
