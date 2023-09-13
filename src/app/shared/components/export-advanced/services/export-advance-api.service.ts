import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams, IArgs, IQueryParamsMedeaGo } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { ExportConfigurationPage } from '../models';

/**
 *
 *
 * @export
 * @class ExportAdvanceApiService
 */
@Injectable({
    providedIn: 'root',
})
export class ExportAdvanceApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof ExportAdvanceApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof ExportAdvanceApiService
     */
    private readonly _exportEndpoint = '/download/export-';

    /**
     *
     *
     * @private
     * @memberof ExportAdvanceApiService
     */
    private readonly _exportHistoryEndpoint = '/export-logs';
    private readonly _returnStatusEndpoint = '/return-status';

    /**
     * Creates an instance of ExportAdvanceApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof ExportAdvanceApiService
     */
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    getExportHistory<T>(params: IQueryParams & IQueryParamsMedeaGo, useMedeaGo?: boolean): Observable<T> {
        let newArgs: IArgs[] = [];

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

        if (params['action']) {
            newArgs.push({
                key: 'action',
                value: params['action'],
            });
        }

        this._url = this.helperSvc.handleApiRouter(this._exportHistoryEndpoint, useMedeaGo);
        let newParams: HttpParams;
        if (useMedeaGo) {
            newParams = this.onBuildParamsExportHistory(params);
        } else {
            newParams = this.helperSvc.handleParams(this._url, params, ...newArgs);
        }
        
        return this.http.get<T>(this._url, { params: newParams });
    }

    onBuildParamsExportHistory(params: IQueryParams & IQueryParamsMedeaGo): HttpParams {
        let newArgs: IArgs[] = [];
        
        if (params['action']) {
            newArgs.push({
                key: 'action',
                value: params['action'],
            });
        }

        if (params['aPage']) {
            newArgs.push({
                key: 'aPage',
                value: params['aPage'],
            });
        }

        if (params['pageIndex']) {
            newArgs.push({
                key: 'page',
                value: params['pageIndex']
            })
        }

        if (params['size']) {
            newArgs.push({
                key: 'size',
                value: params['size']
            })
        }

        return this.helperSvc.handleParams(this._url, null, ...newArgs);;
    }

    requestExport(params: IQueryParams): Observable<{ message: string }> {
        const newArgs = [];

        switch (params['page'] as ExportConfigurationPage) {
            case 'stores':
                params['page'] = 'stores';
                break;

            case 'catalogues':
                params['page'] = 'catalogues';
                break;

            case 'payments':
                params['page'] = 'payments';
                break;

            case 'invoices':
                params['page'] = 'invoices';
                if (params['page']) {
                    newArgs.push({
                        key: 'page',
                        value: 'fms',
                    });
                }
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

    requestExportMedeaGo(params: IQueryParams): Observable<{ message: string }> {
        let body: any = {};
        let exportUrl = ''

        switch (params['page'] as ExportConfigurationPage) {
            case 'returns':
                exportUrl = `/return-parcels/export`;
                break;
            default: {
                const err: ErrorHandler = {
                    id: 'ERR_EXPORT_PAGE_TYPE_UNRECOGNIZED',
                    errors: params,
                };

                throw new ErrorHandler(err);
            }
        };

        if (params['status']) {
            if (params['page'] === 'returns') {
                body.returnStatus = params['status'];
            } else {
                body.status = params['status'];
            }
        };

        body.returnDate = {
            start: params['dateGte'] ? params['dateGte'] : '',
            end: params['dateLte'] ? params['dateLte'] : ''
        };

        this._url = this.helperSvc.handleApiRouter(exportUrl, true);

        return this.http.post<{ message: string }>(this._url, body);
    }

    /** get status list for filter export, default url is return status list */
    getStatusList<T>(params?: IQueryParams, customUrl?: string): Observable<T> {
        this._url = this.helperSvc.handleApiRouter(customUrl || this._returnStatusEndpoint);
        const newParams = this.helperSvc.handleParams(this._url, params);

        return this.http.get<T>(this._url, { params: newParams, headers: {
            "X-Replica": "true",
        } });
    }
}
