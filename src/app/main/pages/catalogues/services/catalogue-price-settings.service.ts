import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CataloguePriceSettingsService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof CataloguePriceSettingsService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof CataloguePriceSettingsService
     */
    private readonly _endpoint = '/pricing-scheme/supplier-ssc';

    /**
     * Creates an instance of MerchantApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof Catalogue Api
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
    getPriceSetting(params): Observable<any> {

        this._url = this._$helper.handleApiRouter(this._endpoint);
        // const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get(this._url, {
            headers: {
                "X-Replica": "true"
            },
        });
    }
}
