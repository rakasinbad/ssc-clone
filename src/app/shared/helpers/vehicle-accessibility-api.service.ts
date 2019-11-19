import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQueryParams } from '../models';
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
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    /**
     *
     *
     * @template T
     * @param {IQueryParams} params
     * @returns {Observable<T>}
     * @memberof VehicleAccessibilityApiService
     */
    findAll<T>(params: IQueryParams): Observable<T> {
        const newParams = this._$helper.handleParams(this._url, params);

        return this.http.get<T>(this._url, { params: newParams });
    }

    // findAllDropdown(params: IQueryParams): Observable<IVehicleAccessibility[]> {
    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     const newParams = this._$helper.handleParams(this._url, params);

    //     return this.http.get<IVehicleAccessibility[]>(this._url, { params: newParams });
    // }
}
