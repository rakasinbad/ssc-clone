import { Catalogue } from 'app/main/pages/catalogues/models';
import { Brand } from 'app/shared/models/brand.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';

interface IPeriodTargetPromoReward {
    id?: string;
    rewardValidDate: {
        activeStartDate: string;
        activeEndDate: string;
    };
    trigger: {
        base: string;
        chosenSku?: Array<Catalogue>;
        chosenBrand?: Array<Brand>;
        chosenFaktur?: Array<InvoiceGroup>;
    };
    condition: {
        base: string;
        qty: string;
        value: string;
    };
    miscellaneous: {
        description: string;
        couponImage: string;
    };
}

export class PeriodTargetPromoReward implements IPeriodTargetPromoReward {
    id?: string;
    rewardValidDate: {
        activeStartDate: string;
        activeEndDate: string;
    };
    trigger: {
        base: string;
        chosenSku?: Array<Catalogue>;
        chosenBrand?: Array<Brand>;
        chosenFaktur?: Array<InvoiceGroup>;
    };
    condition: {
        base: string;
        qty: string;
        value: string;
    };
    miscellaneous: {
        description: string;
        couponImage: string;
    };

    constructor(data: IPeriodTargetPromoReward) {
        const {
            id,
            rewardValidDate,
            trigger,
            condition,
            miscellaneous,
        } = data;

        this.id = id;
        this.rewardValidDate = rewardValidDate;
        this.trigger = trigger;
        this.condition = condition;
        this.miscellaneous = miscellaneous;
    }
}
