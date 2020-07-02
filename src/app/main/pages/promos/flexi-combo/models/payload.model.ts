import { Selection } from 'app/shared/components/multiple-selection/models';
import { BenefitType } from 'app/shared/models/benefit-type.model';
import { ConditionBase } from 'app/shared/models/condition-base.model';
import { EStatus } from 'app/shared/models/global.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';

interface IFlexiComboCondition {
    benefitBonusQty: string;
    benefitCatalogueId: string;
    benefitType: string;
    conditionBase: string;
    conditionQty: number;
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
    promoBudget: number;
    startDate: string;
    status: EStatus;
    supplierId: string;
    target: string;
    type: string;
    voucherCombine: boolean;

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
            startDate,
            status,
            supplierId,
            target,
            type,
            voucherCombine,
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
        this.startDate = startDate;
        this.status = status;
        this.supplierId = supplierId;
        this.target = target;
        this.type = type;
        this.voucherCombine = voucherCombine;
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
    startDate?: string;
    status?: EStatus;
    supplierId?: string;
    target?: string;
    type?: string;
    voucherCombine?: boolean;

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
            startDate,
            status,
            supplierId,
            target,
            type,
            voucherCombine,
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
    }
}
