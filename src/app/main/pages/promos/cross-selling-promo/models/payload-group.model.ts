import { LogicRelation, SellingGroup } from 'app/shared/models';
import { ConditionBase } from 'app/shared/models/condition-base.model';

export interface GroupDatabaseDto {
    catalogueId: number[];
}

export interface GroupPromoConditionDto {
    catalogueId: number;
    conditionBase: ConditionBase;
    conditionQty: number;
    conditionValue: number;
    crossSellingGroup: SellingGroup;
    crossSellingGroupRelation: LogicRelation.OR | LogicRelation.AND;
}

export interface GroupFormDto {
    dataBase: GroupDatabaseDto;
    promoConditionCatalogues: GroupPromoConditionDto[];
    catalogueSegmentationObjectId: string;
}
