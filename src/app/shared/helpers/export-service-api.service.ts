import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IConfigImportAdvanced } from '../components/import-advanced/models';
import { HelperService } from './helper.service';

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
            params = params.set('type', type);
        }

        return this.http.get<IConfigImportAdvanced>(this._url, { params });
    }
}
