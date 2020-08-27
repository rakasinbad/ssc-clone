import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { PortfolioActions } from '../../portfolios/store/actions';
import { CoreFeatureState as PortfolioCoreFeatureState } from '../../portfolios/store/reducers';
import { Association, AssociationForm } from '../models';

/**
 *
 *
 * @export
 * @class SalesRepsApiService
 */
@Injectable({
    providedIn: 'root'
})
export class SalesRepsApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof SalesRepsApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof SalesRepsApiService
     */
    private readonly _endpoint = '/sales-reps';
    private readonly _associationsEndpoint = '/associations';

    /**
     * Creates an instance of SalesRepsApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof SalesRepsApiService
     */
    constructor(
        private http: HttpClient,
        private _$helper: HelperService,
        private portfolioStore: NgRxStore<PortfolioCoreFeatureState>
    ) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findAll<T>(params: IQueryParams, supplierId?: string): Observable<T> {
        const newArg = supplierId
            ? [
                  {
                      key: 'supplierId',
                      value: supplierId
                  }
              ]
            : [];

        if (params['associated']) {
            newArg.push({
                key: 'associated',
                value: 'true'
            });
        } else if (params.hasOwnProperty('associated') && !params['associated']) {
            newArg.push({
                key: 'associated',
                value: 'false'
            });
        }

        if (params['type']) {
            newArg.push({
                key: 'type',
                value: params['type']
            });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArg);

        return this.http.get<T>(this._url, { params: newParams });
    }

    findById<T>(id: string, supplierId?: string): Observable<T> {
        const newArg = [];

        if (!supplierId) {
            throw new Error('SALES_REPS_API_REQUIRES_SUPPLIER_ID');
        } else {
            newArg.push({
                key: 'supplierId',
                value: supplierId
            });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, null, ...newArg);

        return this.http.get<T>(`${this._url}/${id}`, { params: newParams });
    }

    createAssociation(body: AssociationForm): Observable<{ message: string }> {
        this._url = this._$helper.handleApiRouter(this._associationsEndpoint);
        return this.http.post<{ message: string }>(this._url, body);
    }

    findStore<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (params['type']) {
            switch (params['type']) {
                case 'outside':
                case 'inside':
                    newArgs.push({ key: 'type', value: params['type'] });
                    break;
            }
        }

        if (params['keyword']) {
            newArgs.push({ key: 'keyword', value: params['keyword'] });
        }

        if (!isNaN(params['invoiceGroupId'])) {
            newArgs.push({ key: 'invoiceGroupId', value: params['invoiceGroupId'] });
        }

        if (params['request'] === 'associations') {
            this._url = this._$helper.handleApiRouter(this._associationsEndpoint);
        } else {
            this._url = this._$helper.handleApiRouter(this._endpoint);
        }

        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    findAssociations<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (params['type']) {
            switch (params['type']) {
                case 'outside':
                case 'inside':
                    newArgs.push({ key: 'type', value: params['type'] });
                    break;
            }
        }

        if (!isNaN(params['invoiceGroupId'])) {
            newArgs.push({ key: 'invoiceGroupId', value: params['invoiceGroupId'] });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    requestPortfolio(userId: string, invoiceGroupId: string, portfolioEntityType: string): void {
        // Mendapatkan toko yang tersedia.
        const portfolioQuery: IQueryParams = {
            limit: 10,
            skip: 0
        };
        portfolioQuery['type'] = portfolioEntityType;
        portfolioQuery['invoiceGroupId'] = invoiceGroupId;

        this.portfolioStore.dispatch(
            PortfolioActions.fetchPortfoliosRequest({ payload: portfolioQuery })
        );

        // Hanya mendapatkan toko yang terasosiasi dengan sales rep.
        const associatedPortfolioQuery: IQueryParams = {
            limit: 10,
            skip: 0
        };
        associatedPortfolioQuery['userId'] = userId;

        this.portfolioStore.dispatch(
            PortfolioActions.fetchPortfoliosRequest({ payload: portfolioQuery })
        );
    }
}
