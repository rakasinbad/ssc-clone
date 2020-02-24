import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IConfigImportAdvanced } from '../components/import-advanced/models';
import { HelperService } from './helper.service';
import { ExportConfiguration } from '../components/exports/models';

/**
 *
 *
 * @export
 * @class ExportServiceApiService
 */
@Injectable({
    providedIn: 'root'
})
export class ExportServiceApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof ExportServiceApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof ExportServiceApiService
     */
    private readonly _endpoint = '/export-services';

    /**
     * Creates an instance of ExportServiceApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof ExportServiceApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @param {string} type
     * @returns {Observable<IConfigImportAdvanced>}
     * @memberof ExportServiceApiService
     */
    getConfig(type: string): Observable<IConfigImportAdvanced> {
        let params = new HttpParams();

        if (!params.has('type')) {
            switch (type as ExportConfiguration['page']) {
                case 'catalogues': {
                    params = params.set('type', 'catalogues');
                    break;
                }

                case 'journey-plans': {
                    params = params.set('type', 'journey-plans');
                    break;
                }

                case 'orders': {
                    params = params.set('type', 'oms');
                    break;
                }

                case 'payments': {
                    params = params.set('type', 'fms');
                    break;
                }

                case 'portfolios': {
                    params = params.set('type', 'portfolios');
                    break;
                }

                case 'sales-rep': {
                    params = params.set('type', 'sales-rep');
                    break;
                }

                case 'sr-assignment': {
                    params = params.set('type', 'sr-assignment');
                    break;
                }

                case 'stores': {
                    params = params.set('type', 'stores');
                    break;
                }

                default: {
                    params = params.set('type', type);
                }
            }
        }

        return this.http.get<IConfigImportAdvanced>(this._url, { params });
    }
}
