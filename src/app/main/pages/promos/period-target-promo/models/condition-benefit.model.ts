import { Catalogue } from 'app/main/pages/catalogues/models';
import { Brand } from 'app/shared/models/brand.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';

interface ConditionBenefit {
    condition: {
        base: string;
        qty: string;
        value: string;
    };
    benefit: {
        base: string;
        qty: {
            bonusSku: Catalogue;
            applySameSku: boolean;
            bonusQty: number;
            multiplicationOnly: boolean;
        };
        percent: {
            percentDiscount: number;
            maxRebate: number;
        }
        cash: {
            rebate: number;
        }
    };
}

interface IPeriodTargetConditionBenefit {
    id?: string;
    calculationMechanism: string;
    conditionBenefit: Array<ConditionBenefit>;
}

export class PeriodTargetConditionBenefit implements IPeriodTargetConditionBenefit {
    id?: string;
    calculationMechanism: string;
    conditionBenefit: Array<ConditionBenefit>;

    constructor(data: IPeriodTargetConditionBenefit) {
        const {
            id,
            calculationMechanism,
            conditionBenefit,
        } = data;

        this.id = id;
        this.calculationMechanism = calculationMechanism;
        this.conditionBenefit = conditionBenefit;
    }
}
