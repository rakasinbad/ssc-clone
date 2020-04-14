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

interface IStore extends ITimestamp {
    readonly id: NonNullable<string>;
    address: string;
    externalId: string;
    imageUrl: string;
    largeArea: string;
    latitude: number;
    longitude: number;
    name: string;
    noteAddress: string;
    numberOfEmployee: string;
    parentId: string;
    phoneNo: string;
    reason: string;
    status: EStatus;
    storeCode: string;
    taxImageUrl: string;
    taxNo: string;
    urbanId: string;
    vehicleAccessibilityId: string;
}

interface IStoreSegment extends ITimestamp {
    readonly id: NonNullable<string>;
    description: string;
    externalId: string;
    hasChild: boolean;
    name: string;
    parentId: string;
    sequence: number;
    status: EStatus;
    supplierId: string;
}

interface IWarehouse extends ITimestamp {
    readonly id: NonNullable<string>;
    address: string;
    code: string;
    externalId: string;
    latitude: number;
    leadTime: number;
    longitude: number;
    name: string;
    noteAddress: string;
    status: EStatus;
    supplierId: string;
    urbanId: string;
    warehouseTemperatureId: string;
    warehouseValueId: string;
}

export interface IPromoBrand extends ITimestamp {
    readonly id: NonNullable<string>;
    brandId: string;
    promoId: string;
    brand: IBrand;
}

export interface IPromoCatalogue extends ITimestamp {
    readonly id: NonNullable<string>;
    catalogue: ICatalogue;
    promoId: string;
}

export interface IPromoChannel extends ITimestamp {
    readonly id: NonNullable<string>;
    channel: IStoreSegment;
    channelId: string;
    promoId: string;
}

export interface IPromoCluster extends ITimestamp {
    readonly id: NonNullable<string>;
    cluster: IStoreSegment;
    clusterId: string;
    promoId: string;
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

export interface IPromoGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    group: IStoreSegment;
    groupId: string;
    promoId: string;
}

export interface IPromoStore extends ITimestamp {
    readonly id: NonNullable<string>;
    promoId: string;
    store: IStore;
    storeId: string;
}

export interface IPromoType extends ITimestamp {
    readonly id: NonNullable<string>;
    promoId: string;
    type: IStoreSegment;
    typeId: string;
}

export interface IPromoWarehouse extends ITimestamp {
    readonly id: NonNullable<string>;
    promoId: string;
    warehouse: IWarehouse;
    warehouseId: string;
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
    promoChannels?: IPromoChannel[];
    promoClusters?: IPromoCluster[];
    promoConditions?: IPromoCondition[];
    promoGroups?: IPromoGroup[];
    promoInvoiceGroups?: any[];
    promoStores?: IPromoStore[];
    promoTypes?: IPromoType[];
    promoWarehouses?: IPromoWarehouse[];
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
            promoChannels,
            promoClusters,
            promoConditions,
            promoGroups,
            promoInvoiceGroups,
            promoStores,
            promoTypes,
            promoWarehouses,
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

        /* Handle promoChannels */
        if (typeof promoChannels !== 'undefined') {
            this.promoChannels =
                promoChannels &&
                promoChannels.length > 0 &&
                target === SegmentationBase.SEGMENTATION
                    ? promoChannels
                    : [];
        }

        /* Handle promoClusters */
        if (typeof promoClusters !== 'undefined') {
            this.promoClusters =
                promoClusters &&
                promoClusters.length > 0 &&
                target === SegmentationBase.SEGMENTATION
                    ? promoClusters
                    : [];
        }

        /* Handle promoConditions */
        if (typeof promoConditions !== 'undefined') {
            this.promoConditions =
                promoConditions && promoConditions.length > 0 ? promoConditions : [];
        }

        /* Handle promoGroups */
        if (typeof promoGroups !== 'undefined') {
            this.promoGroups =
                promoGroups && promoGroups.length > 0 && target === SegmentationBase.SEGMENTATION
                    ? promoGroups
                    : [];
        }

        /* Handle promoInvoiceGroups */
        if (typeof promoInvoiceGroups !== 'undefined') {
            this.promoInvoiceGroups =
                promoInvoiceGroups && promoInvoiceGroups.length > 0 && base === TriggerBase.INVOICE
                    ? promoInvoiceGroups
                    : [];
        }

        /* Handle promoStores */
        if (typeof promoStores !== 'undefined') {
            this.promoStores =
                promoStores && promoStores.length > 0 && target === SegmentationBase.STORE
                    ? promoStores
                    : [];
        }

        /* Handle promoTypes */
        if (typeof promoTypes !== 'undefined') {
            this.promoTypes =
                promoTypes && promoTypes.length > 0 && target === SegmentationBase.SEGMENTATION
                    ? promoTypes
                    : [];
        }

        /* Handle promoWarehouses */
        if (typeof promoWarehouses !== 'undefined') {
            this.promoWarehouses =
                promoWarehouses &&
                promoWarehouses.length > 0 &&
                target === SegmentationBase.SEGMENTATION
                    ? promoWarehouses
                    : [];
        }
    }
}
