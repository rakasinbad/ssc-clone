import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AvailableSupplierStoreApiService {
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
    private readonly endpoint = '/manual-order/supplier-stores';

    constructor(private http: HttpClient, private readonly helperService: HelperService) {
        this.url = this.helperService.handleApiRouter(this.endpoint);
    }

    findAll<T>(params: IQueryParams): Observable<T> {
        const newArg = [];

        if (params['keyword']) {
            newArg.push({
                key: 'keyword',
                value: params['keyword'],
            });
        }

        const newParams = this.helperService.handleParamsV2(this.url, params, ...newArg);

        return this.http.get<T>(this.url, { params: newParams });
    }
}
