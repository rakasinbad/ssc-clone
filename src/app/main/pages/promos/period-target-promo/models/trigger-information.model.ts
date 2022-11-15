// import { Catalogue } from 'app/main/pages/catalogues/models';
import { Brand } from 'app/shared/models/brand.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';

interface IPeriodTargetPromoTriggerInformation {
    id?: string;
    base: string;
    chosenSku?: Array<any>;
    chosenBrand?: Array<Brand>;
    chosenFaktur?: Array<InvoiceGroup>;
}

export class PeriodTargetPromoTriggerInformation implements IPeriodTargetPromoTriggerInformation {
    id?: string;
    base: string;
    chosenSku?: Array<any>;
    chosenBrand?: Array<Brand>;
    chosenFaktur?: Array<InvoiceGroup>;

    constructor(data: IPeriodTargetPromoTriggerInformation) {
        const {
            id,
            base,
            chosenSku = [],
            chosenBrand = [],
            chosenFaktur = [],
        } = data;

        this.id = id;
        this.base = base;
        this.chosenSku = chosenSku;
        this.chosenBrand = chosenBrand;
        this.chosenFaktur = chosenFaktur;
    }
}
