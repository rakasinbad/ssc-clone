import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ElementRef, Inject, Injectable } from '@angular/core';
import { MatSnackBarConfig } from '@angular/material';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Auth } from 'app/main/pages/core/auth/models';
import { environment } from 'environments/environment';
import * as jwt_decode from 'jwt-decode';
import * as LogRocket from 'logrocket';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { LogicRelation, SpecifiedTarget } from '../models';
import { BenefitMultiType, BenefitType, BenefitVoucherType } from '../models/benefit-type.model';
import { CalculationMechanism } from '../models/calculation-mechanism.model';
import { ConditionBase, RatioBaseCondition } from '../models/condition-base.model';
import { ErrorHandler, TNullable } from '../models/global.model';
import { PlatformSinbad, PlatformSupplierVoucer } from '../models/platform.model';
import {
    PromoAllocation,
    PromoAllocationCross,
    VoucherAllocation,
} from '../models/promo-allocation.model';
import { IQueryParams } from '../models/query.model';
import { SegmentationBase, SegmentationBasePromo } from '../models/segmentation-base.model';

import { SupplierVoucherCategory, SupplierVoucherType } from '../models/supplier-voucher.model';
import { TriggerBase } from '../models/trigger-base.model';
import { PromoHierarchyLayer, PromoHierarchyGroup } from '../models/promo-hierarchy.model';
import { User } from '../models/user.model';
import { NoticeService } from './notice.service';

interface TTemplateFiles {
    catalogueStock: string;
    orderStatus: string;
    paymentStatus: string;
}

@Injectable({ providedIn: 'root' })
export class HelperService {
    private readonly customParams = [
        'brandId',
        'channelId',
        'clusterId',
        'dueDay',
        'groupId',
        'hasChild',
        'invoiceGroupId',
        'keyword',
        'onlyExclusive',
        'priceGte',
        'priceLte',
        'search',
        'status',
        'statusPayment',
        'subBrandId',
        'supplierId',
        'type',
        'typeId',
        'warehouseId',
    ];

    private static readonly _benefitType: { id: BenefitType; label: string }[] = [
        {
            id: BenefitType.QTY,
            label: 'Qty',
        },
        {
            id: BenefitType.AMOUNT,
            label: 'Rp',
        },
        {
            id: BenefitType.PERCENT,
            label: '%',
        },
    ];

    private static readonly _benefitMultiType: { id: BenefitMultiType; label: string }[] = [
        {
            id: BenefitMultiType.QTY,
            label: 'Qty',
        },
        {
            id: BenefitMultiType.AMOUNT,
            label: 'Rp',
        },
    ];

    private static readonly _benefitVoucherType: { id: BenefitVoucherType; label: string }[] = [
        {
            id: BenefitVoucherType.QTY,
            label: 'Qty',
        },
        {
            id: BenefitVoucherType.PERCENT,
            label: '%',
        },
    ];

    private static readonly _calculationMechanism: { id: CalculationMechanism; label: string }[] = [
        {
            id: CalculationMechanism.NON_CUMULATIVE,
            label: 'Non Cumulative',
        },
        {
            id: CalculationMechanism.CUMULATIVE,
            label: 'Cumulative',
        },
    ];

    private static readonly _conditionBase: { id: ConditionBase; label: string }[] = [
        {
            id: ConditionBase.QTY,
            label: 'Qty',
        },
        {
            id: ConditionBase.ORDER_VALUE,
            label: 'Order Value',
        },
    ];

    private static readonly _logicRelation: { id: LogicRelation; label: string }[] = [
        {
            id: LogicRelation.OR,
            label: LogicRelation.OR,
        },
        {
            id: LogicRelation.AND,
            label: LogicRelation.AND,
        },
        {
            id: LogicRelation.NA,
            label: LogicRelation.NA,
        },
    ];

    private static readonly _buyRatioCondition: { id: RatioBaseCondition; label: string }[] = [
        {
            id: RatioBaseCondition.QTY,
            label: 'Qty',
        },
        {
            id: RatioBaseCondition.ORDER_VALUE,
            label: 'Order Value',
        },
    ];

    private static _orderStatuses: Array<{ id: string; label: string }> = [
        {
            id: 'all',
            label: 'All',
        },
        {
            id: 'checkout',
            label: 'Quotation',
        },
        {
            id: 'confirm',
            label: 'New Order',
        },
        {
            id: 'packing',
            label: 'Packed',
        },
        {
            id: 'shipping',
            label: 'Shipped',
        },
        {
            id: 'delivered',
            label: 'Delivered',
        },
        {
            id: 'done',
            label: 'Done',
        },
        {
            id: 'cancel',
            label: 'Canceled',
        },
    ];

    private static _paymentStatuses: Array<{ id: string; label: string }> = [
        {
            id: 'all',
            label: 'All',
        },
        {
            id: 'waiting_for_payment',
            label: 'Waiting for Payment',
        },
        {
            id: 'payment_failed',
            label: 'Payment Failed',
        },
        {
            id: 'paid',
            label: 'Paid',
        },
        {
            id: 'overdue',
            label: 'Overdue',
        },
    ];

    private static readonly _platformSinbad: { id: PlatformSinbad; label: string }[] = [
        {
            id: PlatformSinbad.ALL,
            label: 'All',
        },
        {
            id: PlatformSinbad.AGENT_APP,
            label: 'Sinbad White',
        },
        {
            id: PlatformSinbad.SINBAD_APP,
            label: 'Sinbad Red',
        },
    ];

    private static readonly _platformSupplierVoucher: {
        id: PlatformSupplierVoucer;
        label: string;
    }[] = [
        // {
        //     id: PlatformSupplierVoucer.ALL,
        //     label: 'All',
        // },
        // {
        //     id: PlatformSupplierVoucer.AGENT_APP,
        //     label: 'Sinbad White',
        // },
        {
            id: PlatformSupplierVoucer.SINBAD_APP,
            label: 'Sinbad Red',
        },
    ];

    private static readonly _segmentationBase: { id: SegmentationBase; label: string }[] = [
        {
            id: SegmentationBase.STORE,
            label: 'Direct Store',
        },
        {
            id: SegmentationBase.SEGMENTATION,
            label: 'Segmentation',
        },
    ];

    private static readonly _segmentationBasePromo: {
        id: SegmentationBasePromo;
        label: string;
    }[] = [
        {
            id: SegmentationBasePromo.STORE,
            label: 'Direct Store',
        },
        {
            id: SegmentationBasePromo.SEGMENTATION,
            label: 'Selected Segment Only',
        },
        {
            id: SegmentationBasePromo.ALLSEGMENTATION,
            label: 'Apply to All Linked Segments',
        },
    ];

    private static readonly _promoAllocation: { id: PromoAllocation; label: string }[] = [
        {
            id: PromoAllocation.NONE,
            label: 'None',
        },
        {
            id: PromoAllocation.PROMOSLOT,
            label: 'Max Promo Redemption (transaction)',
        },
        {
            id: PromoAllocation.PROMOBUDGET,
            label: 'Max Promo Redemption (Rp)',
        },
    ];

    private static readonly _promoAllocationCross: { id: PromoAllocationCross; label: string }[] = [
        {
            id: PromoAllocationCross.NONE,
            label: 'None',
        },
        {
            id: PromoAllocationCross.PROMOBUDGET,
            label: 'Max Promo Redemption (Rp)',
        },
        {
            id: PromoAllocationCross.PROMOSLOT,
            label: 'Max Promo Redemption (transaction)',
        },
    ];

    private static readonly _voucherAllocation: { id: VoucherAllocation; label: string }[] = [
        {
            id: VoucherAllocation.NONE,
            label: 'None',
        },
        {
            id: VoucherAllocation.PROMOSLOT,
            label: 'Max Promo Redemption (transaction)',
        },
        // {
        //     id: VoucherAllocation.PROMOBUDGET,
        //     label: 'Max Promo Redemption (Rp)',
        // },
    ];

    private static readonly _supplierVoucherType: { id: SupplierVoucherType; label: string }[] = [
        {
            id: SupplierVoucherType.DIRECT,
            label: 'Direct',
        },
        {
            id: SupplierVoucherType.COLLECTIBLE,
            label: 'Collectible',
        },
    ];

    private static readonly _supplierVoucherCategory: {
        id: SupplierVoucherCategory;
        label: string;
    }[] = [
        {
            id: SupplierVoucherCategory.PRICE_CUT,
            label: 'Price Cut',
        },
        // {
        //     id: SupplierVoucherCategory.BONUS,
        //     label: 'Bonus',
        // }
    ];

    private static _catalogueStatuses: Array<{ id: string; label: string }> = [
        {
            id: 'all',
            label: 'All',
        },
        {
            id: 'active',
            label: 'Live (Active)',
        },
        /* {
            id: 'empty',
            label: 'Empty',
        },
        {
            id: 'banned',
            label: 'Banned',
        }, */
        {
            id: 'inactive',
            label: 'Inactive',
        },
    ];

    private static _catalogueTypes: Array<{ id: string; label: string }> = [
        {
            id: 'all',
            label: 'All',
        },
        {
            id: 'regular',
            label: 'Regular',
        },
        {
            id: 'bonus',
            label: 'Bonus',
        },
    ];

    private static readonly _specifiedTarget: { id: SpecifiedTarget; label: string }[] = [
        {
            id: SpecifiedTarget.NONE,
            label: 'None',
        },
        {
            id: SpecifiedTarget.NEW_STORE,
            label: 'New Store',
        },
        {
            id: SpecifiedTarget.ACTIVE_STORE,
            label: 'Active Outlets Only',
        },
    ];

    private static _storeStatuses: Array<{ id: string; label: string }> = [
        {
            id: 'all',
            label: 'Semua',
        },
        {
            id: 'active',
            label: 'Active',
        },
        {
            id: 'inactive',
            label: 'Inactive',
        },
        {
            id: 'banned',
            label: 'Banned',
        },
    ];

    private static readonly _triggerBase: { id: TriggerBase; label: string }[] = [
        {
            id: TriggerBase.SKU,
            label: 'SKU',
        },
        {
            id: TriggerBase.BRAND,
            label: 'Brand',
        },
        {
            id: TriggerBase.INVOICE,
            label: 'Faktur',
        },
    ];

    private static _globalStatuses: Array<{ id: string; label: string }> = [
        {
            id: 'all',
            label: 'All',
        },
        {
            id: 'active',
            label: 'Active',
        },
        {
            id: 'inactive',
            label: 'Inactive',
        },
    ];

    private static _skpStatus: Array<{ id: string; label: string }> = [
        {
            id: 'active',
            label: 'Active',
        },
        {
            id: 'inactive',
            label: 'Inactive',
        },
    ];

    private static readonly _promoHierarchyLayer: { id: PromoHierarchyLayer; label: string }[] = [
        {
            id: PromoHierarchyLayer.NOL,
            label: 'Layer 00',
        },
        {
            id: PromoHierarchyLayer.ONE,
            label: 'Layer 01',
        },
        {
            id: PromoHierarchyLayer.TWO,
            label: 'Layer 02',
        },
        {
            id: PromoHierarchyLayer.THREE,
            label: 'Layer 03',
        },
        {
            id: PromoHierarchyLayer.FOUR,
            label: 'Layer 04',
        },
    ];

    private static readonly _promoHierarchyGroup: { id: PromoHierarchyGroup; label: string }[] = [
        {
            id: PromoHierarchyGroup.NONE,
            label: 'None',
        },
        {
            id: PromoHierarchyGroup.PRINCIPAL,
            label: 'Principal Promo',
        },
        {
            id: PromoHierarchyGroup.DISTRIBUTOR,
            label: 'Distributor Promo',
        },
        {
            id: PromoHierarchyGroup.SINBAD,
            label: 'Sinbad Promo',
        },
        {
            id: PromoHierarchyGroup.PAYMENT,
            label: 'Payment Method Promo',
        },
    ];

    private static _host = environment.host;
    // tslint:disable-next-line: max-line-length
    private static readonly _regexIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    private _currentHost: string;
    private _attendanceTypes: Array<{ value: string; text: string }> = [
        {
            value: 'absent',
            text: 'Tidak Hadir',
        },
        {
            value: 'present',
            text: 'Hadir',
        },
        {
            value: 'leave',
            text: 'Cuti',
        },
    ];
    private _locationTypes: Array<{ value: string; text: string }> = [
        {
            value: 'inside',
            text: 'Kerja di Toko',
        },
        {
            value: 'outside',
            text: 'Kerja di Luar Toko',
        },
        {
            value: 'others',
            text: 'Lainnya',
        },
    ];

    constructor(
        @Inject(DOCUMENT) private doc: Document,
        private http: HttpClient,
        private storage: StorageMap,
        private _$notice: NoticeService
    ) {
        this._currentHost = this.doc.location.hostname;
    }

    static debug(label: string, data: any = {}): void {
        if (!environment.production) {
            // tslint:disable-next-line:no-console
            console.groupCollapsed(label, data);
            // tslint:disable-next-line:no-console
            console.trace(label, data);
            // tslint:disable-next-line:no-console
            console.groupEnd();
        }
    }

    // Referensi: https://stackoverflow.com/a/1349462
    static generateRandomString(
        len: number,
        charSet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    ): string {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < len; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }

    static getStatusList(
        page: 'stores' | 'catalogues' | 'payments' | 'orders' | 'sales-rep'
    ): Array<{ id: string; label: string }> {
        switch (page) {
            case 'stores':
                return HelperService._storeStatuses;

            case 'catalogues':
                return HelperService._catalogueStatuses;

            case 'payments':
                return HelperService._paymentStatuses;

            case 'orders':
                return HelperService._orderStatuses;

            case 'sales-rep':
                return HelperService._globalStatuses;

            default:
                return [];
        }
    }

    static getTypesList(
        page: 'stores' | 'catalogues' | 'payments' | 'orders' | 'sales-rep'
    ): Array<{ id: string; label: string }> {
        switch (page) {
            case 'catalogues':
                return HelperService._catalogueTypes;
            default:
                return [];
        }
    }

    static truncateText(value: string, maxLength: number, type: 'start' | 'end'): string {
        console.log(value.length, maxLength);

        if (value.length > maxLength) {
            switch (type) {
                case 'start': {
                    const ellipsis = '...';
                    const valueArr = value.split(',');

                    if (valueArr.length > 0) {
                        return `${ellipsis}, ${valueArr[1]}, ${valueArr[2]}`;
                    }

                    return `${ellipsis}${value.slice(-(maxLength - ellipsis.length))}`;
                }

                case 'end':
                default: {
                    const ellipsis = '...';
                    return `${value.slice(0, maxLength - ellipsis.length)}${ellipsis}`;
                }
            }
        }

        return value;
    }

    showErrorNotification = ({ id: errId = '(none)', errors: error = {} }: any) => {
        const noticeSetting: MatSnackBarConfig = {
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            duration: 10000,
        };

        // tslint:disable-next-line: no-inferrable-types
        let message: string = 'Unknown error';
        // tslint:disable-next-line: no-inferrable-types
        let requestId: string = '-';

        if (error.httpError) {
            // Error message related to HTTP.
            if (error.httpError.error) {
                if (error.httpError.error.code || error.httpError.error.message) {
                    (errId = `ERROR_NET_HTTP_${
                        errId !== '(none)' ? errId : error.httpError.error.code || 'UNKNOWN'
                    }`),
                        (message =
                            +error.httpError.error.code >= 500
                                ? 'Network related issue'
                                : 'Client related issue');
                }
            }
        } else if (error.error) {
            // Defined error message.
            if (error.error.message) {
                message = error.error.message;
            }
        }

        if (error.error) {
            if (typeof error.error !== 'string') {
                requestId = !error.error.errors
                    ? '-'
                    : !error.error.errors.uuid
                    ? '-'
                    : error.error.errors.uuid;
            }
        }

        // Read local storage to get sessionId.
        this.storage
            .get<string>('session', { type: 'string' })
            .pipe(take(1))
            .subscribe(() => {
                // Membuat tag time untuk LogRocket.
                const tagTime: string = moment().format('YYYYMMDDHHmmSSSSS');

                // Show error notification based on errId.
                if (!errId.startsWith('ERR_UNRECOGNIZED')) {
                    this._$notice.open(
                        `An error occured.<br/><br/>Error code: ${errId},<br/>Reason: ${message}<br/>Session: ${tagTime}`,
                        'error',
                        noticeSetting
                    );
                } else {
                    this._$notice.open(
                        `Something wrong with our web while processing your request. Please contact Sinbad Team.<br/><br/>
                            Error code: ${errId}<br/>
                            Reason: ${message}<br/>
                            Session: ${tagTime}
                        `,
                        'error',
                        noticeSetting
                    );
                }

                this.reportError(message, requestId, tagTime);
            });
    };

    reportError(message: string, requestId: string, sessionId: string): void {
        if (environment.logRocketId) {
            LogRocket.captureMessage(`${message} - Session: ${sessionId}`, {
                tags: {
                    environment: environment.environment.toUpperCase(),
                    version: environment.appVersion,
                    commitHash: environment.appHash,
                    tagTime: sessionId,
                },
                extra: { tagTime: sessionId, requestId },
            });
        }
    }

    handleApiRouter(endpoint: string): string {
        /* if (
            HelperService._regexIp.test(this._currentHost) ||
            this._currentHost === 'localhost'
        ) {
            return `${}`
        } */

        return `${HelperService._host}${endpoint}`;
    }

    handleHeaders(queryParams: IQueryParams): HttpHeaders {
        let newHeaders = new HttpHeaders();

        if (queryParams['headers']) {
            for (const key of Object.keys(queryParams['headers'])) {
                newHeaders = newHeaders.set(key, queryParams['headers'][key]);
            }
        }

        return newHeaders;
    }

    handleParams(url: string, params: IQueryParams, ...args): HttpParams {
        let newParams = new HttpParams();

        if (params) {
            if (params.isWaitingForPayment) {
                newParams = newParams.set(
                    'is_waiting_for_payment',
                    params.isWaitingForPayment.toString()
                );
            }
            if (params.paginate) {
                if (!newParams.has('$limit')) {
                    newParams = !params.limit
                        ? newParams.set('$limit', '5')
                        : newParams.set('$limit', params.limit.toString());
                }

                // newParams = !params.limit
                //     ? newParams.set('$limit', '5')
                //     : newParams.set('$limit', params.limit.toString());

                if (!newParams.has('$skip')) {
                    newParams = !params.skip
                        ? newParams.set('$skip', '0')
                        : newParams.set('$skip', params.skip.toString());
                }

                // newParams = !params.skip
                //     ? newParams.set('$skip', '0')
                //     : newParams.set('$skip', params.skip.toString());
            } else {
                newParams = !params.paginate
                    ? newParams.set('paginate', 'false')
                    : newParams.set('paginate', 'true');
            }

            if (!newParams.has('sort') && !newParams.has('sortby')) {
                if (params.sort && params.sortBy) {
                    newParams = newParams.set('sort', params.sort).set('sortby', params.sortBy);
                }
            }

            if (params.sort && params.sortBy) {
                newParams = newParams.set('sort', params.sort).set('sortby', params.sortBy);
            }

            if (params.search) {
                if (params.search.length) {
                    for (const search of params.search) {
                        if (search.fieldName && this.customParams.includes(search.fieldName)) {
                            if (search.fieldName === 'statusPayment') {
                                if (newParams.has('dueDay')) {
                                    newParams.delete('dueDay');
                                }
                            }

                            if (search.fieldName === 'dueDay') {
                                if (newParams.has('statusPayment')) {
                                    newParams.delete('statusPayment');
                                }
                            }

                            newParams = newParams.set(`${search.fieldName}`, `${search.keyword}`);
                        } else if (search.fieldName && search.fieldName !== 'id') {
                            newParams = newParams.append(
                                `search[${search.fieldName}]`,
                                `${search.keyword}`
                            );
                        }
                    }
                }
            }
        }

        // console.log('ARGS 1', args);

        if (args && args.length > 0) {
            args.forEach((arg) => {
                if (arg.key && arg.key !== 'headers' && arg.value) {
                    newParams = newParams.append(arg.key, arg.value);
                } else if ((arg.key && arg.key === 'dateLte') || arg.key === 'dateGte') {
                    newParams = newParams.append(arg.key, '');
                }
            });
        }

        // console.log(params);
        // console.log(newParams.toString());

        return newParams;

        /* const newUrl = [`${url}?$limit=${params.limit}&$skip=${params.skip}`];

        if (params.sort && params.sortBy) {
            newUrl[1] = `&sort=${params.sort}&sortBy=${params.sortBy}`;
        }

        if (params.search) {
            if (params.search.length) {
                const searchArr = [];

                for (const search of params.search) {
                    if (search.fieldName && search.fieldName !== 'id') {
                        searchArr.push(`search[${search.fieldName}]=${search.keyword}`);
                    }
                }

                if (searchArr.length > 0) {
                    newUrl[2] = `&${searchArr.join('&')}`;
                }
            }
        }

        return newUrl.join(''); */
    }

    handleParamsCatalogue(url: string, params: IQueryParams, ...args): HttpParams {
        let newParams = new HttpParams();

        // if (params) {
        //     if (params.paginate) {
        //         if (!newParams.has('$limit')) {
        //             newParams = !params.limit
        //                 ? newParams.set('$limit', '5')
        //                 : newParams.set('$limit', params.limit.toString());
        //         }

        //         // newParams = !params.limit
        //         //     ? newParams.set('$limit', '5')
        //         //     : newParams.set('$limit', params.limit.toString());

        //         if (!newParams.has('$skip')) {
        //             newParams = !params.skip
        //                 ? newParams.set('$skip', '0')
        //                 : newParams.set('$skip', params.skip.toString());
        //         }

        //         // newParams = !params.skip
        //         //     ? newParams.set('$skip', '0')
        //         //     : newParams.set('$skip', params.skip.toString());
        //     } else {
        //         newParams = !params.paginate
        //             ? newParams.set('paginate', 'false')
        //             : newParams.set('paginate', 'true');
        //     }

        //     if (!newParams.has('sort') && !newParams.has('sortby')) {
        //         if (params.sort && params.sortBy) {
        //             newParams = newParams.set('sort', params.sort).set('sortby', params.sortBy);
        //         }
        //     }

        //     if (params.sort && params.sortBy) {
        //         newParams = newParams.set('sort', params.sort).set('sortby', params.sortBy);
        //     }

        //     if (params.search) {
        //         if (params.search.length) {
        //             for (const search of params.search) {
        //                 if (
        //                     (search.fieldName && search.fieldName === 'keyword') ||
        //                     search.fieldName === 'type' ||
        //                     search.fieldName === 'statusPayment' ||
        //                     search.fieldName === 'dueDay' ||
        //                     search.fieldName === 'status'
        //                 ) {
        //                     if (search.fieldName === 'statusPayment') {
        //                         if (newParams.has('dueDay')) {
        //                             newParams.delete('dueDay');
        //                         }
        //                     }

        //                     if (search.fieldName === 'dueDay') {
        //                         if (newParams.has('statusPayment')) {
        //                             newParams.delete('statusPayment');
        //                         }
        //                     }

        //                     newParams = newParams.set(`${search.fieldName}`, `${search.keyword}`);
        //                 } else if (search.fieldName && search.fieldName !== 'id') {
        //                     newParams = newParams.append(
        //                         `search[${search.fieldName}]`,
        //                         `${search.keyword}`
        //                     );
        //                 }
        //             }
        //         }
        //     }
        // }

        if (args && args.length > 0) {
            args.forEach((arg) => {
                if (arg.key && arg.key !== 'headers' && arg.value) {
                    newParams = newParams.append(arg.key, arg.value);
                } else if ((arg.key && arg.key === 'dateLte') || arg.key === 'dateGte') {
                    newParams = newParams.append(arg.key, '');
                }
            });
        }

        return newParams;
    }

    isReachable(): Observable<boolean> {
        return this.http
            .head<boolean>('https://id.yahoo.com', {
                // headers: new HttpHeaders({
                //     Accept: '*/*'
                // }),
                observe: 'response',
            })
            .pipe(
                map((res) => res && res.ok && res.status === 200),
                catchError((err) => of(false))
            );
    }

    getQuantityChoices(): Array<{ id: string; label: string }> {
        return [
            { id: 'pcs', label: 'per-Item' },
            { id: 'master_box', label: 'Master Box' },
            { id: 'custom', label: 'Custom' },
        ];
    }

    // buildingType(): { id: string; label: string }[] {}

    numberOfEmployee(): { id: string; label: string }[] {
        return [
            {
                id: '1 - 10',
                label: '1 - 10',
            },
            {
                id: '11 - 20',
                label: '11 - 20',
            },
            {
                id: '20 - 50',
                label: '20 - 50',
            },
            {
                id: '50 - 100',
                label: '50 - 100',
            },
            {
                id: '> 100',
                label: '> 100',
            },
        ];
    }

    storeStatuses(): Array<{ id: string; label: string }> {
        return [
            {
                id: 'guest',
                label: 'Guest',
            },
            {
                id: 'verified',
                label: 'Verified',
            },
            {
                id: 'rejected',
                label: 'Rejected',
            },
            {
                id: 'pending',
                label: 'Pending',
            },
            {
                id: 'updating',
                label: 'Updating',
            },
        ];
    }

    benefitType(): { id: BenefitType; label: string }[] {
        return HelperService._benefitType;
    }

    benefitMultiType(): { id: BenefitMultiType; label: string }[] {
        return HelperService._benefitMultiType;
    }

    benefitVoucherType(): { id: BenefitVoucherType; label: string }[] {
        return HelperService._benefitVoucherType;
    }

    skpStatusType(): { id: string; label: string }[] {
        return HelperService._skpStatus;
    }

    calculationMechanism(): { id: CalculationMechanism; label: string }[] {
        return HelperService._calculationMechanism;
    }

    catalogueStatus(): { id: string; label: string }[] {
        return HelperService._catalogueStatuses;
    }

    catalogueType(): { id: string; label: string }[] {
        return HelperService._catalogueTypes;
    }

    conditionBase(): { id: ConditionBase; label: string }[] {
        return HelperService._conditionBase;
    }

    logicRelation(): { id: LogicRelation; label: string }[] {
        return HelperService._logicRelation;
    }

    buyRatioCondition(): { id: RatioBaseCondition; label: string }[] {
        return HelperService._buyRatioCondition;
    }

    orderStatus(): { id: string; label: string }[] {
        return HelperService._orderStatuses;
    }

    paymentStatus(): { id: string; label: string }[] {
        return HelperService._paymentStatuses;
    }

    platformSinbad(): { id: PlatformSinbad; label: string }[] {
        return HelperService._platformSinbad;
    }

    platformSupplierVoucher(): { id: PlatformSupplierVoucer; label: string }[] {
        return HelperService._platformSupplierVoucher;
    }

    segmentationBase(): { id: SegmentationBase; label: string }[] {
        return HelperService._segmentationBase;
    }

    segmentationBasePromo(): { id: SegmentationBasePromo; label: string }[] {
        return HelperService._segmentationBasePromo;
    }

    promoAllocation(): { id: PromoAllocation; label: string }[] {
        return HelperService._promoAllocation;
    }

    promoAllocationCross(): { id: PromoAllocationCross; label: string }[] {
        return HelperService._promoAllocationCross;
    }

    voucherAllocation(): { id: VoucherAllocation; label: string }[] {
        return HelperService._voucherAllocation;
    }

    supplierVoucherType(): { id: SupplierVoucherType; label: string }[] {
        return HelperService._supplierVoucherType;
    }

    supplierVoucherCategory(): { id: SupplierVoucherCategory; label: string }[] {
        return HelperService._supplierVoucherCategory;
    }
    specifiedTarget(): { id: SpecifiedTarget; label: string }[] {
        return HelperService._specifiedTarget;
    }

    storeStatus(): { id: string; label: string }[] {
        return HelperService._storeStatuses;
    }

    triggerBase(): { id: TriggerBase; label: string }[] {
        return HelperService._triggerBase;
    }

    promoHierarchyLayer(): { id: PromoHierarchyLayer; label: string }[] {
        return HelperService._promoHierarchyLayer;
    }

    promoHierarchyGroup(): { id: PromoHierarchyGroup; label: string }[] {
        return HelperService._promoHierarchyGroup;
    }

    stockType(): { id: boolean; label: string }[] {
        return [
            {
                id: true,
                label: 'Unlimited',
            },
            {
                id: false,
                label: 'Limited',
            },
        ];
    }

    unitParameter(): { id: string; label: string }[] {
        return [
            {
                id: 'province',
                label: 'Provinsi',
            },
            {
                id: 'city',
                label: 'Kota/Kabupaten',
            },
            {
                id: 'district',
                label: 'Kecamatan',
            },
            {
                id: 'urban',
                label: 'Kelurahan',
            },
        ];
    }

    unitParameterType(): { id: string; label: string }[] {
        return [
            {
                id: 'all',
                label: 'Select All',
            },
            {
                id: 'manually',
                label: 'Select Manually',
            },
        ];
    }

    attendanceType(value: string): string {
        const attendanceType = this._attendanceTypes.filter((attType) => attType.value === value);

        if (attendanceType.length === 0) {
            return '-';
        }

        return attendanceType[0].text;
    }

    attendanceTypes(): Array<{ value: string; text: string }> {
        return this._attendanceTypes;
    }

    locationType(value: string): string {
        const locationType = this._locationTypes.filter((locType) => locType.value === value);

        if (locationType.length === 0) {
            return '-';
        }

        return locationType[0].text;
    }

    locationTypes(): Array<{ value: string; text: string }> {
        return this._locationTypes;
    }

    downloadTemplate(): Observable<TTemplateFiles> {
        const url = this.handleApiRouter('/import-template-links');
        return this.http.get<TTemplateFiles>(url);
    }

    decodeUserToken(): Observable<TNullable<User>> {
        return this.storage.get<Auth>('user').pipe(
            map((userAuth: Auth) => {
                if (!userAuth) {
                    throw new ErrorHandler({
                        id: 'ERR_NO_TOKEN',
                        errors: `Local Storage found: ${userAuth}`,
                    });
                } else {
                    try {
                        let userData: User;

                        if (!userAuth.user) {
                            // Decode the token.
                            const decodedToken = jwt_decode<Auth>(userAuth.token);
                            userData = decodedToken.user;
                        } else {
                            userData = userAuth.user;
                        }

                        // Create User object.
                        const user = new User(userData);

                        // Return the value as User object.
                        return user;
                    } catch (e) {
                        throw e;
                    }
                }
            })
        );
    }

    infoNotice(text: string = 'This feature is coming soon!'): void {
        this._$notice.open(text, 'info', {
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            duration: 7000,
        });
    }

    isElementScrolledToBottom(element: ElementRef<HTMLElement>): boolean {
        if (!element) {
            return;
        }

        // Mengambil element native dari CdkScrollable yang sedang di-scroll.
        const { nativeElement = null } = element;

        // Tidak dilanjutkan jika tidak meneumukan nativeElement.
        if (!nativeElement) {
            console.error('nativeElement not found.');
            return false;
        }

        // Mengambil beberapa property dari element native.
        const { clientHeight, scrollTop, scrollHeight } = nativeElement;

        // Pemeriksaan jika scroll sudah mencapai dasar.
        const isReachedBottom = scrollHeight - scrollTop < clientHeight + 48;
        if (!isReachedBottom) {
            // Tidak akan diteruskan jika elemen tersebut tidak di-scroll hingga dasarnya.
            return false;
        }

        return true;
    }

    // noticeError(
    //     error: IErrorHandler,
    //     duration: number = 5000,
    //     horizontalPosition: MatSnackBarHorizontalPosition = 'right',
    //     verticalPosition: MatSnackBarVerticalPosition = 'bottom'
    // ): void {
    //     const noticeSetting: MatSnackBarConfig = {
    //         horizontalPosition,
    //         verticalPosition,
    //         duration,
    //     };

    //     if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
    //         this._$notice.open(`Failed to request export logs. Reason: ${error.errors}`, 'error', noticeSetting);
    //     } else {
    //         this._$notice.open(`Something wrong with our web while requesting export logs. Please contact Sinbad Team.`, 'error', noticeSetting);
    //     }
    // }
}
