import { BenefitType } from 'app/shared/models/benefit-type.model';

export interface BenefitFormDto {
    benefitType: BenefitType;
    conditionBase: string;
    conditionQty: string;
    benefitBonusQty?: string;
    benefitCatalogueId?: string;
    benefitDiscount?: string;
    benefitMaxRebate?: string;
    benefitRebate?: string;
}
