import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentListService {
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
    * @memberof PaymentListApiService
    */
  private readonly _endpoint = '/manual-order';

  /**
   * Creates an instance of PaymentListApiService.
   * @param {HttpClient} http
   * @param {HelperService} _$helper
   * @memberof PaymentListApiService
   */
  constructor(private http: HttpClient, private _$helper: HelperService) {
    this._url = this._$helper.handleApiRouter(this._endpoint);
  }

  paymentList(orderParcelId: string): Observable<any> {
    this._url = this._$helper.handleApiRouter(this._endpoint+'/v1/web/payment-list');

    return this.http.get(this._url, {
      params: {
        orderParcelId
      }
    })
  }
}
