import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BrandAutocomplete } from 'app/shared/components/brand-autocomplete/models';
import { FakturAutocomplete } from 'app/shared/components/faktur-autocomplete/models';
import { DefaultCheckbox } from 'app/shared/components/sinbad-filter/models';
import { GeneratorService, HelperService } from 'app/shared/helpers';
import { IQueryParams, IQuerySearchParams } from 'app/shared/models/query.model';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    Catalogue,
    CatalogueCategory,
    CatalogueFilterDto,
    CatalogueInformation,
    ICatalogue,
    ICataloguesResponse,
    ICatalogueStockResponse,
    ICatalogueUnitResponse,
} from '../models';
import { CatalogueMedia } from '../models/catalogue-media.model';
import { CataloguePrice } from '../models/catalogue-price.model';
import { ApplyFilteredCataloguePricePayload } from '../store/actions/catalogue.actions';

interface ICatalogueTitleParameter {
    allCount: number;
    liveCount: number;
    emptyCount: number;
    blockedCount: number;
}

@Injectable({
    providedIn: 'root',
})
export class CataloguesService implements OnDestroy {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof MerchantApiService
     */
    private _url: string;
    private updateForm$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

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
    private readonly _segmentationPriceEndpoint = '/segmentation-price';

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

    ngOnDestroy(): void {
        this.updateForm$.next('');
        this.updateForm$.complete();
    }

    getUpdateForm(): Observable<string> {
        return this.updateForm$.asObservable();
    }

    broadcastUpdateForm(formIndex: number): void {
        this.updateForm$.next(String(formIndex));
    }

    fetchTotalCatalogueStatuses(
        params: IQueryParams
    ): Observable<{
        total: string;
        totalActive: string;
        totalBonus: string;
        totalInactive: string;
        totalRegular: string;
    }> {
        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }
        delete params['paginate'];

        this._url = this._$helper.handleApiRouter('/calculate-catalogue');
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<{
            total: string;
            totalActive: string;
            totalBonus: string;
            totalInactive: string;
            totalRegular: string;
        }>(this._url, { params: newParams });
    }

    getCatalogueStatuses(data: ICatalogueTitleParameter) {
        const { allCount, liveCount, emptyCount, blockedCount } = data;

        const STATUS_CATALOGUES_KEYS = [
            'STATUS.CATALOGUE.ALL_PARAM.TITLE',
            'STATUS.CATALOGUE.ACTIVE_PARAM.TITLE',
            'STATUS.CATALOGUE.EMPTY_PARAM.TITLE',
            'STATUS.CATALOGUE.BLOCKED_PARAM.TITLE',
            'STATUS.CATALOGUE.INACTIVE.TITLE',
        ];

        return this.translate.instant(STATUS_CATALOGUES_KEYS, {
            allCount,
            liveCount,
            emptyCount,
            blockedCount,
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
                value: true,
            });
        }

        if (params['status']) {
            newArgs.push({
                key: 'status',
                value: params['status'],
            });
        }

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (params['externalId']) {
            newArgs.push({
                key: 'externalId',
                value: params['externalId'],
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
                value: true,
            });
        }

        if (params['status']) {
            newArgs.push({
                key: 'status',
                value: params['status'],
            });
        }

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (!isNaN(params['externalId'])) {
            newArgs.push({
                key: 'externalId',
                value: params['externalId'],
            });
        }

        this._url = this._$helper.handleApiRouter(this._endpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    patchCatalogue(
        id: string,
        data: Partial<Catalogue> | Partial<CatalogueInformation> | Partial<CatalogueMedia>
    ): Observable<Catalogue> {
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
            params: { source: 'sc' },
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

    applySegmentationPrice(
        data: ApplyFilteredCataloguePricePayload
    ): Observable<{ message: string }> {
        this._url = this._$helper.handleApiRouter(this._segmentationPriceEndpoint);
        return this.http.post<{ message: string }>(this._url, data);
    }

    updateCataloguePrices(data: FormData): Observable<{ status: string }> {
        this._url = this._$helper.handleApiRouter(this._catalogueImportEndpoint);
        return this.http.post<{ status: string }>(this._url, data, {
            reportProgress: true,
        });
    }

    getCataloguePriceSettings<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (!isNaN(params['supplierId'])) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId'],
            });
        }

        if (!params['catalogueId']) {
            throw new Error('catalogueId is required.');
        } else {
            newArgs.push({ key: 'catalogueId', value: params['catalogueId'] });
        }

        // if (!Array.isArray(params['warehouseIds'])) {
        //     throw new Error('warehouseIds must be an array.');
        // } else {
        //     newArgs.push({ key: 'warehouseIds', value: `[${params['warehouseIds']}]` });
        // }

        // if (!Array.isArray(params['typeIds'])) {
        //     throw new Error('typeIds must be an array.');
        // } else {
        //     newArgs.push({ key: 'typeIds', value: `[${params['typeIds']}]` });
        // }

        // if (!Array.isArray(params['groupIds'])) {
        //     throw new Error('groupIds must be an array.');
        // } else {
        //     newArgs.push({ key: 'groupIds', value: `[${params['groupIds']}]` });
        // }

        // if (!Array.isArray(params['clusterIds'])) {
        //     throw new Error('clusterIds must be an array.');
        // } else {
        //     newArgs.push({ key: 'clusterIds', value: `[${params['clusterIds']}]` });
        // }

        // if (!Array.isArray(params['channelIds'])) {
        //     throw new Error('channelIds must be an array.');
        // } else {
        //     newArgs.push({ key: 'channelIds', value: `[${params['channelIds']}]` });
        // }

        this._url = this._$helper.handleApiRouter(this._cataloguePriceSettingsEndpoint);
        const newParams = this._$helper.handleParams(this._url, params, ...newArgs);
        return this.http.get<T>(`${this._url}`, { params: newParams });
    }

    updatePriceSetting(priceSettingId: string, price: number): Observable<CataloguePrice> {
        this._url = this._$helper.handleApiRouter(this._cataloguePriceSettingsEndpoint);
        return this.http.patch<CataloguePrice>(`${this._url}/${priceSettingId}`, { price });
    }

    handleSearchGlobalFilter(
        paramsSearch: IQuerySearchParams[] = [],
        globalFilter: CatalogueFilterDto
    ): IQuerySearchParams[] {
        if (globalFilter) {
            if (globalFilter.status) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'status',
                        keyword: globalFilter.status,
                    },
                ];
            }

            if (globalFilter.brandId) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'brandId',
                        keyword: globalFilter.brandId,
                    },
                ];
            }

            if (globalFilter.invoiceGroupId) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'invoiceGroupId',
                        keyword: globalFilter.invoiceGroupId,
                    },
                ];
            }

            if (globalFilter.type) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'type',
                        keyword: globalFilter.type,
                    },
                ];
            }

            if (globalFilter.priceGte) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'priceGte',
                        keyword: globalFilter.priceGte,
                    },
                ];
            }

            if (globalFilter.priceLte) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'priceLte',
                        keyword: globalFilter.priceLte,
                    },
                ];
            }
        }

        return paramsSearch;
    }

    prepareBrandValue(value: BrandAutocomplete): number {
        if (typeof value !== 'object') {
            return null;
        }

        return value && value.hasOwnProperty('id') ? +value.id : null;
    }

    prepareFakturValue(value: FakturAutocomplete): number {
        if (typeof value !== 'object') {
            return null;
        }

        return value && value.hasOwnProperty('id') ? +value.id : null;
    }

    prepareStatusValue(
        status: DefaultCheckbox[],
        totalSource: number
    ): 'all' | 'active' | 'inactive' {
        if (status && status.length) {
            if (status.length === totalSource) {
                return 'all';
            }

            const statusId = status.length === 1 ? status.map((item) => item.id)[0] : null;

            switch (statusId) {
                case 'active':
                    return 'active';

                case 'inactive':
                    return 'inactive';

                default:
                    return null;
            }
        }

        return null;
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
