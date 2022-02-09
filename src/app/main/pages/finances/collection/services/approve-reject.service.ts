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
    private readonly _urlMock = 'https://e7686c2e-1298-481b-a158-af31670f15b3.mock.pstmn.io/collection/v1/reject-reasons?'

    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpointCollection);
    }

    getRejectReasonList(type: string): Observable<any> {
        console.log('masuk service sini->', type)
        // type: string   |   'payment' or 'collection'

        // this._url = this._$helper.handleApiRouter(
        //     this._endpointCollection + '/reject-reasons?type=' + type
        // );

        // return this.http.get(`${this._url}`);
        return this.http.get(`${this._urlMock}`+type);

    }

    patchRejectApprove(body: any, id: string, opts?: IAPIOptions): Observable<any> {
        this._url = this._$helper.handleApiRouter(
            this._endpointCollection + '/internal/payment-approval'
        );
        let headers: HttpHeaders;

        if (opts.header_X_Type) {
            headers = new HttpHeaders({
                'X-Type': opts.header_X_Type,
            });
        }

        return this.http.patch(`${this._url}/${id}`, body, { headers });
    }

}