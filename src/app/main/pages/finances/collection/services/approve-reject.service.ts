import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';

export interface IAPIOptions {
    header_X_Type: string;
}

@Injectable({
    providedIn: 'root',
})
export class ApproveRejectApiService {
    private _url: string;

    private readonly _endpointCollection = '/collection/v1';
    private readonly _urlMock = 'https://e7686c2e-1298-481b-a158-af31670f15b3.mock.pstmn.io/collection/v1'

    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpointCollection);
    }

    getRejectReasonList(type: string): Observable<any> {
        // this._url = this._$helper.handleApiRouter(
        //     this._endpointCollection + '/reject-reasons?type=' + type
        // );
        // return this.http.get(`${this._url}`);

        //using mock
        return this.http.get(`${this._urlMock}`+ '/reject-reasons?'+type);

    }

    patchRejectApprove(body: any, id: number, type: string, opts?: IAPIOptions): Observable<any> {
        // this._url = this._$helper.handleApiRouter(
        //     this._endpointCollection + '/internal/payment-approval'
        // );
        let headers: HttpHeaders;
        let url: string;
        
        if (type == 'collection') {
            url = this._urlMock + '/internal/payment-method-approval'
        } else {
            url = this._urlMock + '/internal/payment-approval'
        }
        return this.http.patch(`${url}/${id}`, body, { headers });
    }

}