import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class SupplierApiService
 */
@Injectable({
    providedIn: 'root'
})
export class SupplierApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof SupplierApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof SupplierApiService
     */
    private readonly _endpoint = '/suppliers';

    /**
     * Creates an instance of SupplierApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof SupplierApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findById(id: string): Observable<any> {
        return this.http.get(`${this._url}/${id}`);
    }
}
