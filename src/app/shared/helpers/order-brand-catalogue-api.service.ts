import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class OrderBrandCatalogueApiService
 */
@Injectable({
    providedIn: 'root'
})
export class OrderBrandCatalogueApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof OrderBrandCatalogueApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof OrderBrandCatalogueApiService
     */
    private readonly _endpoint = '/order-brand-catalogues';

    /**
     * Creates an instance of OrderBrandCatalogueApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof OrderBrandCatalogueApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    patch(body: any, id: string): Observable<any> {
        return this.http.patch(`${this._url}/${id}`, body);
    }
}
