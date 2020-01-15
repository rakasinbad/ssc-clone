import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import { Store as NgRxStore } from '@ngrx/store';
import { IAssociation, IAssociationForm } from '../models';
import { CoreFeatureState as PortfolioCoreFeatureState } from '../../portfolios/store/reducers';
import { PortfolioActions } from '../../portfolios/store/actions';

/**
 *
 *
 * @export
 * @class AssociationApiService
 */
@Injectable({
    providedIn: 'root'
})
export class AssociatedPortfolioApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof AssociationApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof AssociationApiService
     */
    private readonly _portfolioEndpoint = '/portfolios';

    /**
     * Creates an instance of AssociationApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof AssociationApiService
     */
    constructor(
        private http: HttpClient,
        private _$helper: HelperService,
        private portfolioStore: NgRxStore<PortfolioCoreFeatureState>
    ) {
        this._url = this._$helper.handleApiRouter(this._portfolioEndpoint);
    }

    findPortfolio<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (params['type']) {
            switch (params['type']) {
                case 'group':
                case 'direct': newArgs.push({ key: 'type', value: params['type']} ); break;
            }
        }

        if (!isNaN(params['supplierId'])) {
            newArgs.push({ key: 'supplierId', value: params['supplierId'] });
        }

        if (!isNaN(params['invoiceGroupId'])) {
            newArgs.push({ key: 'invoiceGroupId', value: params['invoiceGroupId'] });
        }

        if (!isNaN(params['userId'])) {
            newArgs.push({ key: 'userId', value: params['userId'] });
        }

        this._url = this._$helper.handleApiRouter(this._portfolioEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

}
