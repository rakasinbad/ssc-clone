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
