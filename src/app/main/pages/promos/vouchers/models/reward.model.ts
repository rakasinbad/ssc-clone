import { Catalogue } from 'app/main/pages/catalogues/models';
import { Brand } from 'app/shared/models/brand.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';

interface IVoucherReward {
    id?: string;
    rewardId: string;
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

export class VoucherReward implements IVoucherReward {
    id?: string;
    rewardId: string;
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

    constructor(data: IVoucherReward) {
        const { id, rewardValidDate, trigger, condition, miscellaneous } = data;

        this.id = id;
        this.rewardValidDate = rewardValidDate;
        this.trigger = trigger;
        this.condition = condition;
        this.miscellaneous = miscellaneous;
    }
}
