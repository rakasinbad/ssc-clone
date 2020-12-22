import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { EStatus, TNullable } from 'app/shared/models/global.model';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';

interface ICrossSellingPromoBenefit extends ITimestamp {
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

export class CrossSellingPromoDetail implements ITimestamp {
    readonly id: NonNullable<string>;
    base: TriggerBase;
    supplierId: string;
    channelId: string;
    clusterId: string;
    code: string;
    externalId: string;
    firstBuy: boolean;
    groupId: string;
    imageUrl: string;
    invoiceGroupId: string;
    isCumulative: boolean;
    maxRedemptionPerStore: string;
    name: string;
    platform: PlatformSinbad;
    promoAllocationType: string;
    promoBudget: number;
    planBudget: number;
    promoSlot: number;
    planSlot: number;
    promoConditionCatalogues: ICrossSellingPromoBenefit[];
    startDate: string;
    endDate: string;
    status: EStatus;
    target: SegmentationBase;
    type: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    catalogueSegmentationObjectId: string;

    constructor(data: CrossSellingPromoDetail) {
        const {
            id,
            base,
            channelId,
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
            promoAllocationType,
            promoBudget,
            promoSlot,
            planBudget,
            planSlot,
            promoConditionCatalogues,
            startDate,
            status,
            supplierId,
            target,
            type,
            createdAt,
            updatedAt,
            deletedAt,
            catalogueSegmentationObjectId
        } = data;

        this.id = id;
        this.supplierId = supplierId;
        this.base = base;
        this.channelId = channelId;
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
        this.promoAllocationType = promoAllocationType;
        this.promoBudget = promoBudget || null;
        this.promoSlot = promoSlot || null;
        this.planBudget = planBudget || null;
        this.planSlot = planSlot || null;
        this.promoConditionCatalogues = promoConditionCatalogues;
        this.startDate = startDate;
        this.status = status;
        this.target = target;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.catalogueSegmentationObjectId = catalogueSegmentationObjectId || null;
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