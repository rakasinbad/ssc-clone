interface IVoucherLayer {
    readonly id: NonNullable<string>;
    layer: number;
    promoOwner: string;

}

export class VoucherLayer implements IVoucherLayer {
    readonly id: NonNullable<string>;
    layer: number;
    promoOwner: string;

    constructor(data: IVoucherLayer) {
        const {
            id,
            layer,
            promoOwner
        } = data;

        this.id = id;
        this.layer = layer || 0;
        this.promoOwner = promoOwner || 'none';
    }
}
