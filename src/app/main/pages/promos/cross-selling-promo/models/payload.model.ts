import { Selection } from 'app/shared/components/multiple-selection/models';
import { BenefitType } from 'app/shared/models/benefit-type.model';
import { ConditionBase } from 'app/shared/models/condition-base.model';
import { EStatus } from 'app/shared/models/global.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';

interface ICrossSellingCondition {
    benefitBonusQty: string;
    benefitCatalogueId: string;
    benefitType: string;
    conditionBase: string;
    conditionQty: number;
}

interface ICrossSellingBase {
    // brandId?: string[];
    catalogueId?: string[];
    invoiceGroupId?: string[];
}

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
    conditions: ICrossSellingCondition[];
    dataBase: ICrossSellingBase;
    dataTarget: ICrossSellingDataTarget;
    endDate: string;
    externalId: string;
    firstBuy: boolean;
    image: string;
    maxRedemptionPerStore: number;
    name: string;
    platform: PlatformSinbad;
    promoBudget: number;
    shortDescription: string;
    startDate: string;
    status: EStatus;
    supplierId: string;
    target: string;
    type: string;

    constructor(data: CreateCrossSellingDto) {
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
        this.promoBudget = promoBudget;
        this.shortDescription = (shortDescription && shortDescription.trim()) || null;
        this.startDate = startDate;
        this.status = status;
        this.supplierId = supplierId;
        this.target = target;
        this.type = type;
    }
}

export class PatchCrossSellingDto {
    base?: string;
    conditions?: ICrossSellingCondition[];
    dataBase?: ICrossSellingBase;
    dataTarget?: ICrossSellingDataTarget;
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

    constructor(data: PatchCrossSellingDto) {
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

    }
}

export class ConditionDto {
    readonly id?: string;
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

    constructor(data: ConditionDto) {
        const {
            id,
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
        } = data;

        this.id = id;
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
    }
}
