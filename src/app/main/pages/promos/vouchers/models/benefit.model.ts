interface IVoucherBenefit {
    id?: string;
    base: string;
    rupiah: string;
    percent: string;
    benefitMaxRebate: number;
}

export class VoucherBenefit implements IVoucherBenefit {
    id?: string;
    base: string;
    rupiah: string;
    percent: string;
    benefitMaxRebate: number;

    constructor(data: IVoucherBenefit) {
        const {
            id,
            base,
            rupiah,
            percent,
            benefitMaxRebate
        } = data;

        this.id = id;
        this.base = base;
        this.rupiah = rupiah;
        this.percent = percent;
        this.benefitMaxRebate = benefitMaxRebate || null;
    }
}
