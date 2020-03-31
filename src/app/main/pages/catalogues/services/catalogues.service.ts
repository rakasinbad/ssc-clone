import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import {
    Catalogue,
    CatalogueCategory,
    ICatalogue,
    ICataloguesResponse,
    ICatalogueStockResponse,
    ICatalogueUnitResponse,
    CatalogueInformation
} from '../models';
import { CatalogueMedia } from '../models/catalogue-media.model';
import { CataloguePrice } from '../models/catalogue-price.model';

interface ICatalogueTitleParameter {
    allCount: number;
    liveCount: number;
    emptyCount: number;
    blockedCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class CataloguesService {
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
    private readonly _endpoint = '/catalogues';
    private readonly _catalogueCategoriesEndpoint = '/catalogue-categories';
    private readonly _catalogueStockEndpoint = '/get-stocks';
    private readonly _categoryTreeEndpoint = '/categories-tree';
    private readonly _catalogueImportEndpoint = '/upload/import-catalogues';
    private readonly _cataloguePriceSettingsEndpoint = '/price-settings';

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

    fetchTotalCatalogueStatuses(params: IQueryParams) {
        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }
        delete params['paginate'];

        this._url = this._$helper.handleApiRouter('/calculate-catalogue');
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<{
            total: string;
            totalEmptyStock: string;
            totalActive: string;
            totalInactive: string;
            totalBanned: string;
        }>(this._url, { params: newParams });
    }

    getCatalogueStatuses(data: ICatalogueTitleParameter) {
        const { allCount, liveCount, emptyCount, blockedCount } = data;

        const STATUS_CATALOGUES_KEYS = [
            'STATUS.CATALOGUE.ALL_PARAM.TITLE',
            'STATUS.CATALOGUE.LIVE_PARAM.TITLE',
            'STATUS.CATALOGUE.EMPTY_PARAM.TITLE',
            'STATUS.CATALOGUE.BLOCKED_PARAM.TITLE',
            'STATUS.CATALOGUE.INACTIVE.TITLE'
        ];

        return this.translate.instant(STATUS_CATALOGUES_KEYS, {
            allCount,
            liveCount,
            emptyCount,
            blockedCount
        });
    }

    /**
     *
     *
     * @param {IQueryParams} params
     * @returns {Observable<ICatalogueResponse>}
     * @memberof CataloguesService
     */
    findAll(params: IQueryParams): Observable<ICataloguesResponse> {
        const newArgs = [];

        if (params['emptyStock']) {
            newArgs.push({
                key: 'emptyStock',
                value: true
            });
        }

        if (params['status']) {
            newArgs.push({
                key: 'status',
                value: params['status']
            });
        }

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (params['externalId']) {
            newArgs.push({
                key: 'externalId',
                value: params['externalId']
            });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<ICataloguesResponse>(this._url, { params: newParams });
    }

    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (params['emptyStock']) {
            newArgs.push({
                key: 'emptyStock',
                value: true
            });
        }

        if (params['status']) {
            newArgs.push({
                key: 'status',
                value: params['status']
            });
        }

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }

        if (!isNaN(params['externalId'])) {
            newArgs.push({
                key: 'externalId',
                value: params['externalId']
            });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    patchCatalogue(id: string, data: Partial<Catalogue> | Partial<CatalogueInformation> | Partial<CatalogueMedia>): Observable<Catalogue> {
        this._url = this._$helper.handleApiRouter(`${this._endpoint}/${id}`);
        return this.http.patch<Catalogue>(this._url, data);
    }

    getCategory(id: number): Observable<CatalogueCategory> {
        this._url = this._$helper.handleApiRouter(`/catalogue-categories/${id}`);
        return this.http.get<CatalogueCategory>(this._url);
    }

    /**
     *
     *
     * @param {string} id
     * @returns {Observable<ICtalogue>}
     * @memberof CataloguesService
     */
    findById(id: string): Observable<ICatalogue> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.get<ICatalogue>(`${this._url}/${id}`);
    }

    getStock(id: string): Observable<ICatalogueStockResponse> {
        this._url = this._$helper.handleApiRouter(this._catalogueStockEndpoint);
        return this.http.get<ICatalogueStockResponse>(`${this._url}/${id}`);
    }

    removeCatalogue(id: string | number): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.delete<any>(`${this._url}/${id}`);
    }

    setCatalogueToActive(id: string | number): Observable<Catalogue> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<Catalogue>(`${this._url}/${id}`, { status: 'active' });
    }

    setCatalogueToInactive(id: string | number): Observable<Catalogue> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.patch<Catalogue>(`${this._url}/${id}`, { status: 'inactive' });
    }

    getCatalogueCategories(params: IQueryParams): Observable<Array<CatalogueCategory>> {
        const newArgs = [];

        this._url = this._$helper.handleApiRouter(this._catalogueCategoriesEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<Array<CatalogueCategory>>(`${this._url}`, { params: newParams });
    }

    getCategoryTree(): Observable<Array<CatalogueCategory>> {
        this._url = this._$helper.handleApiRouter(this._categoryTreeEndpoint);
        return this.http.get<Array<CatalogueCategory>>(`${this._url}`, {
            params: { source: 'sc' }
        });
    }

    getCatalogueUnitOfMeasurement(params: IQueryParams): Observable<Array<ICatalogueUnitResponse>> {
        this._url = this._$helper.handleApiRouter('/catalogue-units');
        const newParams = this._$helper.handleParams(this._url, params);
        return this.http.get<Array<ICatalogueUnitResponse>>(`${this._url}`, { params: newParams });
    }

    addNewCatalogue(data: any): Observable<any> {
        this._url = this._$helper.handleApiRouter(this._endpoint);
        return this.http.post<Catalogue>(this._url, data);
    }

    updateCataloguePrices(data: FormData): Observable<{ status: string }> {
        this._url = this._$helper.handleApiRouter(this._catalogueImportEndpoint);
        return this.http.post<{ status: string }>(this._url, data, {
            reportProgress: true
        });
    }

    getCataloguePriceSettings<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!(params['catalogueId'])) {
            throw new Error('catalogueId is required.');
        } else {
            newArgs.push({ key: 'catalogueId', value: params['catalogueId'] });
        }

        if (!Array.isArray(params['warehouseIds'])) {
            throw new Error('warehouseIds must be an array.');
        } else {
            newArgs.push({ key: 'warehouseIds', value: params['warehouseIds'] });
        }

        if (params['typeIds']) {
            if (!Array.isArray(params['typeIds'])) {
                throw new Error('typeIds must be an array.');
            } else {
                newArgs.push({ key: 'typeIds', value: params['typeIds'] });
            }
        }

        if (params['groupIds']) {
            if (!Array.isArray(params['groupIds'])) {
                throw new Error('groupIds must be an array.');
            } else {
                newArgs.push({ key: 'groupIds', value: params['groupIds'] });
            }
        }

        if (params['clusterIds']) {
            if (!Array.isArray(params['clusterIds'])) {
                throw new Error('clusterIds must be an array.');
            } else {
                newArgs.push({ key: 'clusterIds', value: params['clusterIds'] });
            }
        }

        if (params['channelIds']) {
            if (!Array.isArray(params['channelIds'])) {
                throw new Error('channelIds must be an array.');
            } else {
                newArgs.push({ key: 'channelIds', value: params['channelIds'] });
            }
        }

        this._url = this._$helper.handleApiRouter(this._cataloguePriceSettingsEndpoint);
        const newParams = this._$helper.handleParams(this._url, params);
        return this.http.get<T>(`${this._url}`, { params: newParams });
    }

    // findPriceSettings<T>(params: IQueryParams): Observable<T> {
    //     const newArgs = [];

    //     if (!(params['catalogueId'])) {
    //         throw new Error('catalogueId is required.');
    //     } else {
    //         newArgs.push({ key: 'catalogueId', value: params['catalogueId'] });
    //     }

    //     if (!Array.isArray(params['warehouseIds'])) {
    //         throw new Error('warehouseIds must be an array.');
    //     } else {
    //         newArgs.push({ key: 'warehouseIds', value: params['warehouseIds'] });
    //     }

    //     if (params['typeIds']) {
    //         if (!Array.isArray(params['typeIds'])) {
    //             throw new Error('typeIds must be an array.');
    //         } else {
    //             newArgs.push({ key: 'typeIds', value: params['typeIds'] });
    //         }
    //     }

    //     if (params['groupIds']) {
    //         if (!Array.isArray(params['groupIds'])) {
    //             throw new Error('groupIds must be an array.');
    //         } else {
    //             newArgs.push({ key: 'groupIds', value: params['groupIds'] });
    //         }
    //     }

    //     if (params['clusterIds']) {
    //         if (!Array.isArray(params['clusterIds'])) {
    //             throw new Error('clusterIds must be an array.');
    //         } else {
    //             newArgs.push({ key: 'clusterIds', value: params['clusterIds'] });
    //         }
    //     }

    //     if (params['channelIds']) {
    //         if (!Array.isArray(params['channelIds'])) {
    //             throw new Error('channelIds must be an array.');
    //         } else {
    //             newArgs.push({ key: 'channelIds', value: params['channelIds'] });
    //         }
    //     }

    //     this._url = this._$helper.handleApiRouter(this._endpoint);
    //     const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

    //     return this.http.get<T>(this._url, { params: newParams });
    // }

    // getErrorMessageNonState(field: string, type: string, args?: any): string {
    //     const labelName = this.translate.instant(`FORM.${field.toUpperCase()}`);

    //     this.logSvc.generateGroup(
    //         '[ERROR MESSAGE NON STATE]',
    //         {
    //             type: {
    //                 type: 'log',
    //                 value: type
    //             },
    //             field: {
    //                 type: 'log',
    //                 value: field
    //             },
    //             label: {
    //                 type: 'log',
    //                 value: labelName
    //             }
    //         },
    //         'groupCollapsed'
    //     );

    //     switch (type) {
    //         case 'alpha_pattern':
    //             return this.translate.instant('ERROR.ALPHA_PATTERN', { fieldName: labelName });

    //         case 'email_pattern':
    //             return this.translate.instant('ERROR.EMAIL_PATTERN', { fieldName: labelName });

    //         case 'max_length':
    //             return this.translate.instant('ERROR.MAX_LENGTH', {
    //                 fieldName: labelName,
    //                 maxValue: args
    //             });

    //         case 'mobile_phone_length_pattern':
    //             const { prefix, length } = args;

    //             return this.translate.instant('ERROR.MOBILE_PHONE_LENGTH_PATTERN', {
    //                 fieldName: labelName,
    //                 prefix,
    //                 length
    //             });

    //         case 'mobile_phone_pattern':
    //             return this.translate.instant('ERROR.MOBILE_PHONE_PATTERN', {
    //                 fieldName: labelName,
    //                 prefix: args
    //             });

    //         case 'pattern':
    //             return this.translate.instant('ERROR.PATTERN', { fieldName: labelName });

    //         case 'required':
    //             return this.translate.instant('ERROR.REQUIRED', { fieldName: labelName });

    //         case 'selected':
    //             return this.translate.instant('ERROR.SELECTED', { fieldName: labelName });

    //         default:
    //             break;
    //     }
    // }

    // getErrorMessageState(form: any, field: string): string {
    //     console.groupCollapsed('[ERROR MESSAGE STATE]');
    //     console.log(form);
    //     console.log(field);
    //     console.groupEnd();

    //     return 'Error';
    // }
}
