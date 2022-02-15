import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { PaymReject } from '../models';

export interface IAPIOptions {
    header_X_Type?: string;
    header_X_Internal_API_Key?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ApproveRejectApiService {
    private _url: string;

    private readonly _endpointCollection = '/collection/v1';

    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpointCollection);
    }

    getRejectReasonList(type: string): Observable<any> {
        this._url = this._$helper.handleApiRouter(
            this._endpointCollection + '/reject-reasons?type=' + type
        );

        return this.http.get(`${this._url}`);

    }

    patchRejectApprove(body : any, id:any,  opts?: IAPIOptions): Observable<any> {
        this._url = this._$helper.handleApiRouter(
            this._endpointCollection + '/internal/payment-approval'
        );

        let headers: HttpHeaders;

        if (opts.header_X_Internal_API_Key) {
            headers = new HttpHeaders({
                'X-Internal-API-Key': opts.header_X_Internal_API_Key,
            });
        }

        return this.http.patch(`${this._url}/${id}`,body,{headers});
    }

}