import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BrandService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof MerchantApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof MerchantApiService
     */
    private readonly _endpoint = '/brands';

    /**
     * Creates an instance of MerchantApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof MerchantApiService
     */
    constructor(
        private http: HttpClient,
        private _$generator: GeneratorService,
        private _$helper: HelperService,
        private translate: TranslateService
    ) {}

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<ICatalogueResponse>}
     * @memberof CataloguesService
     */
    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (params['supplierId']) {
            newArgs.push({
                key: 'supplier_id',
                value: params['supplierId']
            });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }
}
