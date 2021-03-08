interface IVoucherLayer {
    readonly id: NonNullable<string>;
    promoLayer: number;
    promoOwner: string;

}

export class VoucherLayer implements IVoucherLayer {
    readonly id: NonNullable<string>;
    promoLayer: number;
    promoOwner: string;

    constructor(data: IVoucherLayer) {
        const {
            id,
            promoLayer,
            promoOwner
        } = data;

        this.id = id;
        this.promoLayer = promoLayer || 0;
        this.promoOwner = promoOwner || 'none';
    }
}
