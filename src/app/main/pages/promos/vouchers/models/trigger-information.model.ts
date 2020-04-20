import { Catalogue } from 'app/main/pages/catalogues/models';
import { Brand } from 'app/shared/models/brand.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';

interface IVoucherTriggerInformation {
    id?: string;
    base: string;
    chosenSku?: Array<Catalogue>;
    chosenBrand?: Array<Brand>;
    chosenFaktur?: Array<InvoiceGroup>;
}

export class VoucherTriggerInformation implements IVoucherTriggerInformation {
    id?: string;
    base: string;
    chosenSku?: Array<Catalogue>;
    chosenBrand?: Array<Brand>;
    chosenFaktur?: Array<InvoiceGroup>;

    constructor(data: IVoucherTriggerInformation) {
        const { id, base, chosenSku = [], chosenBrand = [], chosenFaktur = [] } = data;

        this.id = id;
        this.base = base;
        this.chosenSku = chosenSku;
        this.chosenBrand = chosenBrand;
        this.chosenFaktur = chosenFaktur;
    }
}
