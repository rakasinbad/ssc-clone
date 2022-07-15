import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { NodeStringDecoder } from 'string_decoder';

@Injectable({ providedIn: 'root' })
export class QtySettingsApiService {
      /**
     * @private
     * @type {string}
     * @memberof QtySettingsApiService
     */
       private _url: string;

       /**
        * @private
        * @memberof QtySettingsApiService
        */
       private readonly _endpoint = '/supplier-quantity-setting';
   
       /**
        * Creates an instance of QtySettingsApiService.
        * @param {HttpClient} http
        * @param {HelperService} _$helper
        * @memberof QtySettingsApiService
        */
       constructor(private http: HttpClient, private _$helper: HelperService) {
          this._url = this._$helper.handleApiRouter(this._endpoint);
       }
   
       /**
        * @template T
        * @returns {Observable<T>}
        * @memberof QtySettingsApiService
        */
       get<T>(supplierId: string): Observable<T> {
          return this.http.get<T>(`${this._url}/${supplierId}`);
       }
}
