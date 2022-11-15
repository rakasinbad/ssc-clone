import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportProductsService {
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
    * @memberof OrderAddApiService
    */
  private readonly _endpoint = '/manual-order';

  /**
   * Creates an instance of OrderAddApiService.
   * @param {HttpClient} http
   * @param {HelperService} _$helper
   * @memberof OrderAddApiService
   */
  constructor(private http: HttpClient, private _$helper: HelperService) {
    this._url = this._$helper.handleApiRouter(this._endpoint);
  }

  importProducts(formData: FormData): Observable<any> {
    this._url = this._$helper.handleApiRouter(this._endpoint+'/import-products');
    

    return this.http.post(this._url, formData, {
      reportProgress: true
    });
  }
}