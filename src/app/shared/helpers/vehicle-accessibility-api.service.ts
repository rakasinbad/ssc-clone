import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams, IVehicleAccessibility, IVehicleAccessibilityResponse } from '../models';
import { HelperService } from './helper.service';

/**
 *
 *
 * @export
 * @class VehicleAccessibilityApiService
 */
@Injectable({
    providedIn: 'root'
})
export class VehicleAccessibilityApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof VehicleAccessibilityApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof VehicleAccessibilityApiService
     */
    private _endpoint = '/vehicle-accessibilities';

    /**
     * Creates an instance of VehicleAccessibilityApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof VehicleAccessibilityApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {}

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<IVehicleAccessibilityResponse[]>}
     * @memberof VehicleAccessibilityApiService
     */
    findAll(params: IQueryParams): Observable<IVehicleAccessibilityResponse[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IVehicleAccessibilityResponse[]>(this._url, { params: newParams });
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<IVehicleAccessibility[]>}
     * @memberof VehicleAccessibilityApiService
     */
    findAllDropdown(params: IQueryParams): Observable<IVehicleAccessibility[]> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<IVehicleAccessibility[]>(this._url, { params: newParams });
    }
}
