import { Catalogue } from 'app/main/pages/catalogues/models';
import { Brand } from 'app/shared/models/brand.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';

interface IVoucherConditionSettings {
    id?: string;
    base: string;
    chosenSku?: Array<Catalogue>;
    chosenBrand?: Array<Brand>;
    chosenFaktur?: Array<InvoiceGroup>;
}

export class VoucherConditionSettings implements IVoucherConditionSettings {
    id?: string;
    base: string;
    chosenSku?: Array<Catalogue>;
    chosenBrand?: Array<Brand>;
    chosenFaktur?: Array<InvoiceGroup>;

    constructor(data: IVoucherConditionSettings) {
        const { id, base, chosenSku = [], chosenBrand = [], chosenFaktur = [] } = data;

        this.id = id;
        this.base = base;
        this.chosenSku = chosenSku;
        this.chosenBrand = chosenBrand;
        this.chosenFaktur = chosenFaktur;
    }
}
