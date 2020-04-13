import { ConditionBase } from 'app/shared/models/condition-base.model';
import { EStatus, TNullable } from 'app/shared/models/global.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';

interface IFlexiComboCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;
}

export class FlexiComboCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;

    constructor(data: IFlexiComboCreationPayload) {
        const { warehouseId, catalogueId, deletedCatalogue } = data;

        this.warehouseId = warehouseId;
        this.catalogueId = catalogueId;
        this.deletedCatalogue = deletedCatalogue;
    }
}

// export interface IFlexiCombo extends ITimestamp {
//     readonly id: NonNullable<string>;
//     base: TriggerBase;
//     channelId: string;
//     code: string;
//     endDate: string;
//     externalId: string;
//     firstBuy: boolean;
//     groupId: string;
//     imageUrl: string;
//     invoiceGroupId: string;
//     isComulative: boolean;
//     maxRedemptionPerStore: string;
//     name: string;
//     platform: PlatformSinbad;
//     promoBudget: number;
//     startDate: string;
//     supplierId: string;
//     target: SegmentationBase;
//     type: string;
//     voucherCombine: boolean;
// }

interface IBrand extends ITimestamp {
    readonly id: NonNullable<string>;
    address: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    name: string;
    official: boolean;
    phoneNo: string;
    status: EStatus;
    urbanId: string;
}

interface ICatalogue extends ITimestamp {
    readonly id: NonNullable<string>;
    barcode: string;
    brandId: string;
    catalogueDimension: string;
    catalogueTaxId: string;
    catalogueWeight: number;
    dangerItem: boolean;
    description: string;
    detail: string;
    externalId: string;
    first_catalogue_category_id: string;
    firstCatalogueCategoryId: string;
    information: string;
    last_catalogue_category_id: string;
    lastCatalogueCategoryId: string;
    minQty: string;
    minQtyType: string;
    multipleQty: number;
    multipleQtyType: string;
    name: string;
    packagedDimension: string;
    packagedQty: number;
    packagedWeight: number;
    retailBuyingPrice: number;
    sku: string;
    status: EStatus;
    suggestedConsumerBuyingPrice: number;
    unit_of_measure_id: string;
    unitOfMeasureId: string;
    violationReason: string;
    violationSuggestion: string;
    violationTypeId: string;
}

export interface IPromoBrand extends ITimestamp {
    readonly id: NonNullable<string>;
    brandId: string;
    promoId: string;
    brand: IBrand;
}

export interface IPromoCondition extends ITimestamp {
    readonly id: NonNullable<string>;
    benefitBonusQty: string;
    benefitCatalogueId: string;
    benefitDiscount: string;
    benefitMaxRebate: string;
    benefitRebate: string;
    benefitType: string;
    conditionBase: ConditionBase;
    conditionQty: string;
    conditionValue: number;
    multiplication: boolean;
    promoId: string;
}

export interface IPromoCatalogue extends ITimestamp {
    readonly id: NonNullable<string>;
    catalogue: ICatalogue;
    promoId: string;
}

export class FlexiCombo implements ITimestamp {
    readonly id: NonNullable<string>;
    base: TriggerBase;
    channelId: string;
    clusterId: string;
    code: string;
    endDate: string;
    externalId: string;
    firstBuy: boolean;
    groupId: string;
    imageUrl: string;
    invoiceGroupId: string;
    isComulative: boolean;
    maxRedemptionPerStore: string;
    name: string;
    platform: PlatformSinbad;
    promoBrands?: IPromoBrand[];
    promoBudget: number;
    promoCatalogues?: IPromoCatalogue[];
    promoConditions?: IPromoCondition[];
    promoInvoiceGroups?: any[];
    startDate: string;
    status: EStatus;
    supplierId: string;
    target: SegmentationBase;
    type: string;
    voucherCombine: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: FlexiCombo) {
        const {
            id,
            base,
            channelId,
            clusterId,
            code,
            endDate,
            externalId,
            firstBuy,
            groupId,
            imageUrl,
            invoiceGroupId,
            isComulative,
            maxRedemptionPerStore,
            name,
            platform,
            promoBrands,
            promoBudget,
            promoCatalogues,
            promoConditions,
            promoInvoiceGroups,
            startDate,
            status,
            supplierId,
            target,
            type,
            voucherCombine,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.base = base;
        this.channelId = channelId;
        this.clusterId = clusterId;
        this.code = code ? String(code).trim() : null;
        this.endDate = endDate;
        this.externalId = externalId;
        this.firstBuy = firstBuy;
        this.groupId = groupId;
        this.imageUrl = imageUrl ? String(imageUrl).trim() : null;
        this.invoiceGroupId = invoiceGroupId;
        this.isComulative = isComulative;
        this.maxRedemptionPerStore = maxRedemptionPerStore;
        this.name = name ? String(name).trim() : null;
        this.platform = platform;
        this.promoBudget = promoBudget;
        this.startDate = startDate;
        this.status = status;
        this.supplierId = supplierId;
        this.target = target;
        this.type = type;
        this.voucherCombine = voucherCombine;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        /* Handle promoBrands */
        if (typeof promoBrands !== 'undefined') {
            this.promoBrands =
                promoBrands && promoBrands.length > 0 && base === TriggerBase.BRAND
                    ? promoBrands
                    : [];
        }

        /* Handle promoCatalogues */
        if (typeof promoCatalogues !== 'undefined') {
            this.promoCatalogues =
                promoCatalogues && promoCatalogues.length > 0 && base === TriggerBase.SKU
                    ? promoCatalogues
                    : [];
        }

        /* Handle promoConditions */
        if (typeof promoConditions !== 'undefined') {
            this.promoConditions =
                promoConditions && promoConditions.length > 0 ? promoConditions : [];
        }

        /* Handle promoInvoiceGroups */
        if (typeof promoInvoiceGroups !== 'undefined') {
            this.promoInvoiceGroups =
                promoInvoiceGroups && promoInvoiceGroups.length > 0 && base === TriggerBase.INVOICE
                    ? promoInvoiceGroups
                    : [];
        }
    }
}
