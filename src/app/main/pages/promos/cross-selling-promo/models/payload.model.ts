import { Selection } from 'app/shared/components/multiple-selection/models';
import { BenefitType } from 'app/shared/models/benefit-type.model';
import { ConditionBase } from 'app/shared/models/condition-base.model';
import { EStatus } from 'app/shared/models/global.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';

//for benefit 
interface ICrossSellingPromoBenefit {
    benefitBonusQty: string;
    benefitCatalogueId: string;
    benefitType: string;
}

//for choose sku group
interface ICrossSellingBase {
    // brandId?: string[];
    catalogueId?: string[];
    invoiceGroupId?: string[];
}

//for cross selling group
interface ICrossSellingGrouping {
    baseGroup: ConditionBase;
    fakturGroup: string;
    triggerGroup: string;
    skuGroupChoosen: string[]; //this is get data from ICrossSellingBase (choose sku)
    relationGroup: string;
    qtyGroup: number;
    orderValueGroup: number;
}

//for customer segmentation setting
interface ICrossSellingDataTarget {
    channelId?: string[];
    clusterId?: string[];
    groupId?: string[];
    storeId?: string[];
    typeId?: string[];
    warehouseId?: string[];
}

export class CreateCrossSellingDto {
    base: string;
    dataBase: ICrossSellingBase;
    dataGroup: ICrossSellingGrouping[];
    dataBenefit: ICrossSellingPromoBenefit[];
    dataTarget: ICrossSellingDataTarget;
    endDate: string;
    externalId: string;
    firstBuy: boolean;
    image: string;
    maxRedemptionPerStore: number;
    name: string;
    platform: PlatformSinbad;
    promoAllocationType: string;
    promoBudget: number;
    planBudget: number;
    promoSlot: number;
    planSlot: number;
    shortDescription: string;
    startDate: string;
    status: EStatus;
    supplierId: string;
    target: string;
    type: string;
    isNewStore: boolean;
    isActiveStore: boolean;

    constructor(data: CreateCrossSellingDto) {
        const {
            base,
            dataBenefit,
            dataBase,
            dataTarget,
            endDate,
            externalId,
            firstBuy,
            image,
            maxRedemptionPerStore,
            name,
            platform,
            promoAllocationType,
            promoBudget,
            planBudget,
            promoSlot,
            planSlot,
            shortDescription,
            startDate,
            status,
            supplierId,
            target,
            type,
            isNewStore,
            isActiveStore
        } = data;

        this.base = base;
        this.dataBenefit = dataBenefit;
        this.dataBase = dataBase;
        this.dataTarget = dataTarget;
        this.endDate = endDate;
        this.externalId = externalId;
        this.firstBuy = firstBuy;
        this.image = image;
        this.maxRedemptionPerStore = maxRedemptionPerStore;
        this.name = name;
        this.platform = platform;
        this.promoAllocationType = promoAllocationType;
        this.promoBudget = promoBudget || null;
        this.planBudget = planBudget || null;
        this.promoSlot = promoSlot || null;
        this.planSlot = planSlot || null;
        this.shortDescription = (shortDescription && shortDescription.trim()) || null;
        this.startDate = startDate;
        this.status = status;
        this.supplierId = supplierId;
        this.target = target;
        this.type = type;
        this.isNewStore = isNewStore;
        this.isActiveStore = isActiveStore;
    }
}

export class PatchCrossSellingDto {
    base?: string;
    dataBase?: ICrossSellingBase;
    dataGroup: ICrossSellingGrouping[];
    dataBenefit?: ICrossSellingPromoBenefit[];
    dataTarget?: ICrossSellingDataTarget;
    endDate?: string;
    externalId?: string;
    firstBuy?: boolean;
    image?: string;
    maxRedemptionPerStore?: number;
    name?: string;
    platform?: PlatformSinbad;
    promoAllocationType?: string;
    promoBudget?: number;
    planBudget?: number;
    promoSlot?: number;
    planSlot?: number;
    shortDescription?: string;
    startDate?: string;
    status?: EStatus;
    supplierId?: string;
    target?: string;
    type?: string;
    isActiveStore?: boolean;
    isNewStore?: boolean;

    constructor(data: PatchCrossSellingDto) {
        const {
            base,
            dataBenefit,
            dataBase,
            dataTarget,
            endDate,
            externalId,
            firstBuy,
            image,
            maxRedemptionPerStore,
            name,
            platform,
            promoAllocationType,
            promoBudget,
            promoSlot,
            planBudget,
            planSlot,
            shortDescription,
            startDate,
            status,
            supplierId,
            target,
            type,
            isNewStore,
            isActiveStore
        } = data;

        if (typeof base !== 'undefined') {
            this.base = base;
        }

        if (typeof dataBenefit !== 'undefined') {
            this.dataBenefit = dataBenefit;
        }

        if (typeof dataBase !== 'undefined') {
            this.dataBase = dataBase;
        }

        if (typeof dataTarget !== 'undefined') {
            this.dataTarget = dataTarget;
        }

        if (typeof endDate !== 'undefined') {
            this.endDate = endDate;
        }

        if (typeof externalId !== 'undefined') {
            this.externalId = externalId;
        }

        if (typeof firstBuy !== 'undefined') {
            this.firstBuy = firstBuy;
        }

        if (typeof image !== 'undefined') {
            this.image = image;
        }

        if (typeof maxRedemptionPerStore !== 'undefined') {
            this.maxRedemptionPerStore = maxRedemptionPerStore;
        }

        if (typeof name !== 'undefined') {
            this.name = name;
        }

        if (typeof platform !== 'undefined') {
            this.platform = platform;
        }

        if (typeof promoAllocationType !== 'undefined') {
            this.promoAllocationType = promoAllocationType;
        }

        if (typeof promoBudget !== 'undefined') {
            this.promoBudget = promoBudget;
        }

        if (typeof promoSlot !== 'undefined') {
            this.promoSlot = promoSlot;
        }

        if (typeof planBudget !== 'undefined') {
            this.planBudget = planBudget;
        }

        if (typeof planSlot !== 'undefined') {
            this.planSlot = planSlot;
        }

        if (typeof shortDescription !== 'undefined') {
            this.shortDescription = (shortDescription && shortDescription.trim()) || null;
        }

        if (typeof startDate !== 'undefined') {
            this.startDate = startDate;
        }

        if (typeof status !== 'undefined') {
            this.status = status;
        }

        if (typeof supplierId !== 'undefined') {
            this.supplierId = supplierId;
        }

        if (typeof target !== 'undefined') {
            this.target = target;
        }

        if (typeof type !== 'undefined') {
            this.type = type;
        }

        if (typeof isNewStore !== 'undefined') {
            this.isNewStore = isNewStore;
        }

        if (typeof isActiveStore !== 'undefined') {
            this.isActiveStore = isActiveStore;
        }

    }
}

export class BenefitDto {
    readonly id?: string;
    benefitBonusQty: number;
    benefitCatalogueId: string;
    benefitDiscount: number;
    benefitMaxRebate: number;
    benefitRebate: number;
    benefitType: BenefitType;
    catalogue?: Selection;

    constructor(data: BenefitDto) {
        const {
            id,
            benefitBonusQty,
            benefitCatalogueId,
            benefitDiscount,
            benefitMaxRebate,
            benefitRebate,
            benefitType,
            catalogue
        } = data;

        this.id = id;
        this.benefitBonusQty = benefitBonusQty;
        this.benefitCatalogueId = benefitCatalogueId;
        this.benefitDiscount = benefitDiscount;
        this.benefitMaxRebate = benefitMaxRebate;
        this.benefitRebate = benefitRebate;
        this.benefitType = benefitType;
        this.catalogue = catalogue;
    }
}
