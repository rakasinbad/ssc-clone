import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CancelOrderReasonApiService {
  /**
   *
   *
   * @private
   * @type {string}
   * @memberof
   */
  private _url: string;

  /**
    *
    *
    * @private
    * @memberof CancelOrderReasonApiService
    */
  private readonly _endpoint = '/order-cancel-reasons';

  /**
   * Creates an instance of CancelOrderReasonApiService
   * @param {HttpClient} http
   * @param {HelperService} _$helper
   * @memberof CancelOrderReasonApiService
   */
  constructor(private http: HttpClient, private _$helper: HelperService) {
    this._url = this._$helper.handleApiRouter(this._endpoint);
  }

  findAll(params?: IQueryParams): Observable<any> {
   /** TODO: integrate with real api */
    this._url = 'https://httpbin.org/get'//this._$helper.handleApiRouter(this._endpoint);
    return this.http.get(`${this._url}`);
  }
}
