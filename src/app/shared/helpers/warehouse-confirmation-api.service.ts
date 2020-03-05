import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
    IWarehouseConfirmation,
    PayloadWarehouseConfirmation
} from '../models/warehouse-confirmation.model';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class WarehouseConfirmationApiService
 */
@Injectable({
    providedIn: 'root'
})
export class WarehouseConfirmationApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof WarehouseConfirmationApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof WarehouseConfirmationApiService
     */
    private readonly _endpoint = '/warehouse-confirmation';

    /**
     * Creates an instance of WarehouseConfirmationApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof WarehouseConfirmationApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @param {PayloadWarehouseConfirmation} body
     * @returns {Observable<IWarehouseConfirmation>}
     * @memberof WarehouseConfirmationApiService
     */
    check(body: PayloadWarehouseConfirmation): Observable<IWarehouseConfirmation> {
        return this.http.post<IWarehouseConfirmation>(this._url, body);
    }
}
