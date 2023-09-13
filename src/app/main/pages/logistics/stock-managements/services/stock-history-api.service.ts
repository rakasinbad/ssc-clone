import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';

/**
 *
 *
 * @export
 * @class StockHistoryApiService
 */
@Injectable({
    providedIn: 'root'
})
export class StockHistoryApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof StockHistoryApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof StockHistoryApiService
     */
    private readonly _endpoint = '/catalogue-histories';

    /**
     * Creates an instance of StockHistoryApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof StockHistoryApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    update<T>(body: T): Observable<any> {
        return this.http.post<any>(this._url, body);
    }
}
