import { Catalogue } from 'app/main/pages/catalogues/models';
import { Brand } from 'app/shared/models/brand.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';

interface IVoucherConditionSettings {
    id: number;
    base: string;
    qty: string;
    orderValue: string;
}

export class VoucherConditionSettings implements IVoucherConditionSettings {
    id: number;
    base: string;
    qty: string;
    orderValue: string;

    constructor(data: IVoucherConditionSettings) {
        const {
            id,
            base,
            qty,
            orderValue,
        } = data;

        this.id = id;
        this.base = base;
        this.qty = qty;
        this.orderValue = orderValue;
    }
}
