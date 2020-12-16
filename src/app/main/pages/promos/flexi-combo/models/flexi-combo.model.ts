import { BenefitType } from 'app/shared/models/benefit-type.model';
import { ConditionBase, RatioBaseCondition } from 'app/shared/models/condition-base.model';
import { EStatus, TNullable } from 'app/shared/models/global.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { SegmentationBasePromo } from 'app/shared/models/segmentation-base.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { PromoAllocation } from 'app/shared/models/promo-allocation.model';

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
//     isCumulative: boolean;
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

interface IInvoiceGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    code: string;
    externalId: string;
    minimumOrder: string;
    name: string;
    status: EStatus;
    supplierId: string;
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
    benefitBonusQty: number;
    benefitCatalogueId: string;
    benefitDiscount: number;
    benefitMaxRebate: number;
    benefitRebate: number;
    benefitType: BenefitType;
    catalogue?: ICatalogue;
    conditionBase: ConditionBase;
    conditionQty: string;
    conditionValue: number;
    multiplication: boolean;
    promoId: string;
    ratioBase: RatioBaseCondition;
    ratioQty: number;
    ratioValue: number;
}

export interface IPromoGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    group: IStoreSegment;
    groupId: string;
    promoId: string;
}

export interface IPromoInvoiceGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    invoiceGroup: IInvoiceGroup;
    invoiceGroupId: string;
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
    isCumulative: boolean;
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
    promoInvoiceGroups?: IPromoInvoiceGroup[];
    promoStores?: IPromoStore[];
    promoTypes?: IPromoType[];
    promoWarehouses?: IPromoWarehouse[];
    shortDescription: string;
    startDate: string;
    status: EStatus;
    supplierId: string;
    target: SegmentationBasePromo;
    type: string;
    voucherCombine: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    isNewStore: boolean;
    isActiveStore: boolean;
    promoAllocationType: PromoAllocation;
    promoSlot: number;

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
            isCumulative,
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
            shortDescription,
            startDate,
            status,
            supplierId,
            target,
            type,
            voucherCombine,
            createdAt,
            updatedAt,
            deletedAt,
            isNewStore,
            isActiveStore,
            promoAllocationType,
            promoSlot
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
        this.isCumulative = isCumulative;
        this.maxRedemptionPerStore = maxRedemptionPerStore;
        this.name = name ? String(name).trim() : null;
        this.platform = platform;
        this.promoBudget = promoBudget;
        this.shortDescription = (shortDescription && shortDescription.trim()) || null;
        this.startDate = startDate;
        this.status = status;
        this.supplierId = supplierId;
        this.target = target;
        this.type = type;
        this.voucherCombine = voucherCombine;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.isActiveStore = isActiveStore;
        this.isNewStore = isNewStore;
        this.promoAllocationType = promoAllocationType;
        this.promoSlot = promoSlot;
        
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
        // if (typeof promoChannels !== 'undefined') {
        //     this.promoChannels =
        //         promoChannels &&
        //         promoChannels.length > 0 &&
        //         target === SegmentationBasePromo.SEGMENTATION
        //             ? promoChannels
        //             : [];
        // }

        /* Handle promoClusters */
        // if (typeof promoClusters !== 'undefined') {
        //     this.promoClusters =
        //         promoClusters &&
        //         promoClusters.length > 0 &&
        //         target === SegmentationBasePromo.SEGMENTATION
        //             ? promoClusters
        //             : [];
        // }

        /* Handle promoConditions */
        if (typeof promoConditions !== 'undefined') {
            this.promoConditions =
                promoConditions && promoConditions.length > 0 ? promoConditions : [];
        }

        /* Handle promoGroups */
        // if (typeof promoGroups !== 'undefined') {
        //     this.promoGroups =
        //         promoGroups && promoGroups.length > 0 && target === SegmentationBasePromo.SEGMENTATION
        //             ? promoGroups
        //             : [];
        // }

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
                promoStores && promoStores.length > 0 && target === SegmentationBasePromo.STORE
                    ? promoStores
                    : [];
        }

        /* Handle promoTypes */
        // if (typeof promoTypes !== 'undefined') {
        //     this.promoTypes =
        //         promoTypes && promoTypes.length > 0 && target === SegmentationBasePromo.SEGMENTATION
        //             ? promoTypes
        //             : [];
        // }

        /* Handle promoWarehouses */
        if (typeof promoWarehouses !== 'undefined') {
            this.promoWarehouses =
                promoWarehouses &&
                promoWarehouses.length > 0 &&
                target === SegmentationBasePromo.ALLSEGMENTATION
                    ? promoWarehouses
                    : [];
        }
    }
}

export class WarehouseDetail {
    readonly id: NonNullable<string>;
    warehouseId: string;
    warehouseName: string;
    typeId: string;
    typeName: string;
    groupId: string;
    groupName: string;
    clusterId: string;
    clusterName: string;
    channelId: string;
    channelName: string;

    constructor(data: WarehouseDetail) {
        const {
            id,
            warehouseId,
            warehouseName,
            typeId,
            typeName,
            groupId,
            groupName,
            clusterId,
            clusterName,
            channelId,
            channelName
        } = data;

        this.id = id;
      
        this.warehouseId = warehouseId || null;
        this.warehouseName = warehouseName || null;
        this.typeId = typeId || null;
        this.typeName = typeName || null;
        this.groupId = groupId || null;
        this.groupName = groupName || null;
        this.clusterId = clusterId || null;
        this.clusterName = clusterName || null;
        this.channelId = channelId || null;
        this.channelName = channelName || null;
    }
}