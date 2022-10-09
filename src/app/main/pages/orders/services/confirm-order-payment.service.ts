import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { IConfirmOrderPayment } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ConfirmOrderPaymentService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof
     */
    private url: string;

    /**
     *
     *
     * @private
     * @memberof OrderApiService
     */
    private readonly endpoint = '/payment/v1/order/confirm';

    constructor(private http: HttpClient, private readonly helperService: HelperService) {
        this.url = this.helperService.handleApiRouter(this.endpoint);
    }

    post(body: IConfirmOrderPayment): Observable<any> {
        return this.http.post(this.url, body);
    }
}
