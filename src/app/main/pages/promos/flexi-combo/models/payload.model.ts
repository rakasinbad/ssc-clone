import { EStatus } from 'app/shared/models/global.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { ConditionBase } from 'app/shared/models/condition-base.model';
import { BenefitType } from 'app/shared/models/benefit-type.model';

interface IFlexiComboCondition {
    benefitBonusQty: string;
    benefitCatalogueId: string;
    benefitType: string;
    conditionBase: string;
    conditionQty: number;
    multiplication: boolean;
}

interface IFlexiComboDataBase {
    catalogueId?: string[];
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
    maxRedemptionPerUser: number;
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
            maxRedemptionPerUser,
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
        this.maxRedemptionPerUser = maxRedemptionPerUser;
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

export class ConditionDto {
    applySameSku?: boolean;
    benefitBonusQty: number;
    benefitCatalogueId: string;
    benefitDiscount: number;
    benefitMaxRebate: number;
    benefitRebate: number;
    benefitType: BenefitType;
    conditionBase: ConditionBase;
    conditionQty: number;
    conditionValue: number;
    multiplication: boolean;

    constructor(data: ConditionDto) {
        const {
            applySameSku,
            benefitBonusQty,
            benefitCatalogueId,
            benefitDiscount,
            benefitMaxRebate,
            benefitRebate,
            benefitType,
            conditionBase,
            conditionQty,
            conditionValue,
            multiplication,
        } = data;

        this.applySameSku = applySameSku;
        this.benefitBonusQty = benefitBonusQty;
        this.benefitCatalogueId = benefitCatalogueId;
        this.benefitDiscount = benefitDiscount;
        this.benefitMaxRebate = benefitMaxRebate;
        this.benefitRebate = benefitRebate;
        this.benefitType = benefitType;
        this.conditionBase = conditionBase;
        this.conditionQty = conditionQty;
        this.conditionValue = conditionValue;
        this.multiplication = multiplication;
    }
}
