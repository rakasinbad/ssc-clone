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
}
