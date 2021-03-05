import { BenefitType } from 'app/shared/models/benefit-type.model';
import { ConditionBase } from 'app/shared/models/condition-base.model';
import { EStatus, TNullable } from 'app/shared/models/global.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';

interface ICrossSellingCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;
}

export class CrossSellingCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;

    constructor(data: ICrossSellingCreationPayload) {
        const { warehouseId, catalogueId, deletedCatalogue } = data;

        this.warehouseId = warehouseId;
        this.catalogueId = catalogueId;
        this.deletedCatalogue = deletedCatalogue;
    }
}

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

export interface ICrossSellingPromoBenefit extends ITimestamp {
    readonly id: NonNullable<string>;
    benefitCatalogueId: string;
    benefitDiscount: string;
    benefitMaxRebate: string;
    benefitType: string;
    benefit_bonus_qty: string;
    catalogue: ICatalogueGroup[];
    deletedAt: TNullable<string>;
    promoConditionBrands: promoConditionBrand[]
    promoConditionCatalogues: PromoConditionCatalogue[];
    promoConditionInvoiceGroups: promoConditionInvoiceGroup[];
    promoId: string;
    multiplication: boolean;
}

interface promoConditionBrand extends ITimestamp {
    readonly id: NonNullable<string>;
}

interface PromoConditionCatalogue extends ITimestamp {
    readonly id: NonNullable<string>;
    promoConditionId: string;
    crossSellingGroup: string;
    crossSellingGroupRelation: string;
    catalogueId: string;
    conditionBase: string;
    conditionQty: string;
    conditionValue: TNullable<number>;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    catalogue: ICatalogueGroup[];
}

interface ICatalogueGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    brand_id: string;
    brand: IBrandGroup;
}

interface IBrandGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    invoiceGroupBrands: InvoiceBrandGroup[];
}

interface InvoiceBrandGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    brand_id: string;
    invoice_group_id: string;
    invoiceGroup: InvoiceGroup;
}

interface InvoiceGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
}

interface promoConditionInvoiceGroup extends ITimestamp {
    readonly id: NonNullable<string>;
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

//for cross selling group
export interface ICrossSellingGrouping extends ITimestamp {
    readonly id: NonNullable<string>;
    baseGroup: ConditionBase;
    fakturGroup: string;
    triggerGroup: string;
    skuGroupChoosen: string[]; //this is get data from ICrossSellingBase (choose sku)
    relationGroup: string;
    qtyGroup: number;
    orderValueGroup: number;
}

export class CrossSelling implements ITimestamp {
    readonly id: NonNullable<string>;
    supplierId: string;
    externalId: string;
    code: string;
    name: string;
    platform: PlatformSinbad;
    isCumulative: boolean;
    maxRedemptionPerStore: string;
    promoAllocationType: string;
    promoBudget: number;
    planBudget: number;
    promoSlot: number;
    planSlot: number;
    base: TriggerBase;
    channelId: string;
    clusterId: string;
    endDate: string;
    firstBuy: boolean;
    groupId: string;
    imageUrl: string;
    invoiceGroupId: string;
    promoBrands?: IPromoBrand[];
    promoCatalogues?: IPromoCatalogue[];
    promoChannels?: IPromoChannel[];
    promoClusters?: IPromoCluster[];
    promoBenefit?: ICrossSellingPromoBenefit[];
    promoGroups?: IPromoGroup[];
    promoInvoiceGroups?: IPromoInvoiceGroup[];
    promoStores?: IPromoStore[];
    promoTypes?: IPromoType[];
    promoWarehouses?: IPromoWarehouse[];
    promoCrossGroup?: ICrossSellingGrouping;
    shortDescription: string;
    startDate: string;
    status: EStatus;
    target: SegmentationBase;
    type: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    isNewStore: boolean;
    isActiveStore: boolean;
    multiplication: boolean;
    catalogueSegmentationObjectId: string;
    skpId: string;
    promoLayer: number;
    promoOwner: string;

    constructor(data: CrossSelling) {
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
            promoAllocationType,
            promoBudget,
            promoSlot,
            planBudget,
            planSlot,
            promoCatalogues,
            promoChannels,
            promoClusters,
            promoBenefit,
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
            createdAt,
            updatedAt,
            deletedAt,
            isNewStore,
            isActiveStore,
            multiplication,
            catalogueSegmentationObjectId,
            skpId,
            promoLayer,
            promoOwner
        } = data;

        this.id = id;
        this.base = base;
        this.channelId = channelId;
        this.clusterId = clusterId;
        this.code = code ? String(code).trim() : null;
        this.externalId = externalId;
        this.firstBuy = firstBuy || null;
        this.groupId = groupId;
        this.imageUrl = imageUrl ? String(imageUrl).trim() : null;
        this.invoiceGroupId = invoiceGroupId;
        this.isCumulative = isCumulative;
        this.maxRedemptionPerStore = maxRedemptionPerStore;
        this.name = name ? String(name).trim() : null;
        this.promoAllocationType = promoAllocationType;
        this.platform = platform;
        this.promoBudget = promoBudget || null;
        this.promoSlot = promoSlot || null;
        this.planBudget = planBudget || null;
        this.planSlot = planSlot || null;
        this.shortDescription = (shortDescription && shortDescription.trim()) || null;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.supplierId = supplierId;
        this.target = target;
        this.type = type;
        this.createdAt = createdAt || null;
        this.updatedAt = updatedAt || null;
        this.deletedAt = deletedAt || null;
        this.isActiveStore = isActiveStore;
        this.isNewStore = isNewStore;
        this.multiplication = multiplication || false;
        this.catalogueSegmentationObjectId = catalogueSegmentationObjectId || null;
        this.skpId = skpId;
        this.promoLayer = promoLayer || 0;
        this.promoOwner = promoOwner || 'none';

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

        /* Handle promoBenefit */
        if (typeof promoBenefit !== 'undefined') {
            this.promoBenefit = promoBenefit;
        } else if (typeof promoBenefit == 'undefined') {
            this.promoBenefit = [];
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
