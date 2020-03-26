import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StoreTypeCrudApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StoreTypeCrudApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StoreTypeCrudApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StoreTypeCrudApiService
     */
    private readonly _endpoint = '/types';

    /**
     * Creates an instance of StoreTypeCrudApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StoreTypeCrudApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    create<T>(body: T): Observable<any> {
        return this.http.post<any>(this._url, body);
    }
}
