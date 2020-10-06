import { Selection } from 'app/shared/components/multiple-selection/models';
import { BenefitType } from 'app/shared/models/benefit-type.model';
import { ConditionBase, RatioBaseCondition } from 'app/shared/models/condition-base.model';
import { EStatus } from 'app/shared/models/global.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { PromoAllocation } from 'app/shared/models/promo-allocation.model';

interface IFlexiComboCondition {
    benefitBonusQty: string;
    benefitCatalogueId: string;
    benefitType: string;
    conditionBase: string;
    conditionQty: number;
    ratioBase: string;
    ratioQty: number;
    multiplication: boolean;
}

interface IFlexiComboDataBase {
    brandId?: string[];
    catalogueId?: string[];
    invoiceGroupId?: string[];
}

interface IFlexiComboDataTarget {
    channelId?: string[];
    clusterId?: string[];
    groupId?: string[];
    storeId?: string[];
    typeId?: string[];
    warehouseId?: string[];
}

export class CreateFlexiComboDto {
    base: string;
    conditions: IFlexiComboCondition[];
    dataBase: IFlexiComboDataBase;
    dataTarget: IFlexiComboDataTarget;
    endDate: string;
    externalId: string;
    firstBuy: boolean;
    image: string;
    maxRedemptionPerStore: number;
    name: string;
    platform: PlatformSinbad;
    shortDescription: string;
    startDate: string;
    status: EStatus;
    supplierId: string;
    target: string;
    type: string;
    voucherCombine: boolean;
    promoBudget: number;
    promoAllocationType: PromoAllocation;
    promoSlot: number;
    isNewStore: boolean;
    isActiveStore: boolean;

    constructor(data: CreateFlexiComboDto) {
        const {
            base,
            conditions,
            dataBase,
            dataTarget,
            endDate,
            externalId,
            firstBuy,
            image,
            maxRedemptionPerStore,
            name,
            platform,
            promoBudget,
            shortDescription,
            startDate,
            status,
            supplierId,
            target,
            type,
            voucherCombine,
            promoSlot,
            promoAllocationType,
            isNewStore,
            isActiveStore
        } = data;

        this.base = base;
        this.conditions = conditions;
        this.dataBase = dataBase;
        this.dataTarget = dataTarget;
        this.endDate = endDate;
        this.externalId = externalId;
        this.firstBuy = firstBuy;
        this.image = image;
        this.maxRedemptionPerStore = maxRedemptionPerStore;
        this.name = name;
        this.platform = platform;

        this.shortDescription = (shortDescription && shortDescription.trim()) || null;
        this.startDate = startDate;
        this.status = status;
        this.supplierId = supplierId;
        this.target = target;
        this.type = type;
        this.voucherCombine = voucherCombine;
        this.promoAllocationType = promoAllocationType;
        this.isNewStore = isNewStore;
        this.isActiveStore = isActiveStore;

        if (this.promoAllocationType == 'none') {
            this.promoBudget = null;
            this.promoSlot = null;
        } else {
            this.promoBudget = promoBudget || null;
            this.promoSlot = promoSlot || null;
        }
    }
}

export class PatchFlexiComboDto {
    base?: string;
    conditions?: IFlexiComboCondition[];
    dataBase?: IFlexiComboDataBase;
    dataTarget?: IFlexiComboDataTarget;
    endDate?: string;
    externalId?: string;
    firstBuy?: boolean;
    image?: string;
    maxRedemptionPerStore?: number;
    name?: string;
    platform?: PlatformSinbad;
    promoBudget?: number;
    shortDescription?: string;
    startDate?: string;
    status?: EStatus;
    supplierId?: string;
    target?: string;
    type?: string;
    voucherCombine?: boolean;
    promoSlot?: number;
    promoAllocationType?: string;
    isActiveStore?: boolean;
    isNewStore?: boolean;

    constructor(data: PatchFlexiComboDto) {
        const {
            base,
            conditions,
            dataBase,
            dataTarget,
            endDate,
            externalId,
            firstBuy,
            image,
            maxRedemptionPerStore,
            name,
            platform,
            promoBudget,
            shortDescription,
            startDate,
            status,
            supplierId,
            target,
            type,
            voucherCombine,
            promoAllocationType,
            promoSlot,
            isNewStore,
            isActiveStore
        } = data;

        if (typeof base !== 'undefined') {
            this.base = base;
        }

        if (typeof conditions !== 'undefined') {
            this.conditions = conditions;
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

        if (typeof promoBudget !== 'undefined') {
            this.promoBudget = promoBudget;
        }

        if (typeof promoAllocationType !== 'undefined') {
            this.promoAllocationType = promoAllocationType;
        }

        if (typeof promoSlot !== 'undefined') {
            this.promoSlot = promoSlot;
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

        if (typeof voucherCombine !== 'undefined') {
            this.voucherCombine = voucherCombine;
        }

        if (typeof isNewStore !== 'undefined') {
            this.isNewStore = isNewStore;
        }

        if (typeof isActiveStore !== 'undefined') {
            this.isActiveStore = isActiveStore;
        }
    }
}

export class ConditionDto {
    readonly id?: string;
    applySameSku?: boolean;
    benefitBonusQty: number;
    benefitCatalogueId: string;
    benefitDiscount: number;
    benefitMaxRebate: number;
    benefitRebate: number;
    benefitType: BenefitType;
    catalogue?: Selection;
    conditionBase: ConditionBase;
    conditionQty: string;
    conditionValue: number;
    multiplication: boolean;
    ratioBase: RatioBaseCondition;
    ratioQty: number;
    ratioValue: number;

    constructor(data: ConditionDto) {
        const {
            id,
            applySameSku,
            benefitBonusQty,
            benefitCatalogueId,
            benefitDiscount,
            benefitMaxRebate,
            benefitRebate,
            benefitType,
            catalogue,
            conditionBase,
            conditionQty,
            conditionValue,
            multiplication,
            ratioBase,
            ratioQty,
            ratioValue
        } = data;

        this.id = id;
        this.applySameSku = applySameSku;
        this.benefitBonusQty = benefitBonusQty;
        this.benefitCatalogueId = benefitCatalogueId;
        this.benefitDiscount = benefitDiscount;
        this.benefitMaxRebate = benefitMaxRebate;
        this.benefitRebate = benefitRebate;
        this.benefitType = benefitType;
        this.catalogue = catalogue;
        this.conditionBase = conditionBase;
        this.conditionQty = conditionQty;
        this.conditionValue = conditionValue;
        this.multiplication = multiplication;
        this.ratioBase = ratioBase;
        this.ratioQty = ratioQty;
        this.ratioValue = ratioValue;
    }
}
