import { Catalogue } from 'app/main/pages/catalogues/models';
import { Brand } from 'app/shared/models/brand.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';

interface IVoucherBenefit {
    id?: string;
    base: string;
    rupiah: string;
    percent: string;
}

export class VoucherBenefit implements IVoucherBenefit {
    id?: string;
    base: string;
    rupiah: string;
    percent: string;

    constructor(data: IVoucherBenefit) {
        const {
            id,
            base,
            rupiah,
            percent,
        } = data;

        this.id = id;
        this.base = base;
        this.rupiah = rupiah;
        this.percent = percent;
    }
}
