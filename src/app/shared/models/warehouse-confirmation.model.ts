export interface IPayloadWarehouseConfirmation {
    invoiceGroupId: string;
    warehouseId: string;
}

export class PayloadWarehouseConfirmation implements IPayloadWarehouseConfirmation {
    invoiceGroupId: string;
    warehouseId: string;

    constructor(data: IPayloadWarehouseConfirmation) {
        const { invoiceGroupId, warehouseId } = data;

        this.invoiceGroupId = invoiceGroupId;
        this.warehouseId = warehouseId;
    }

    clear(): PayloadWarehouseConfirmation {
        return new PayloadWarehouseConfirmation(undefined);
    }
}

export interface IWarehouseConfirmation {
    invoiceId?: string;
    countCatalogue: string;
    faktur: string;
}

export class WarehouseConfirmation implements IWarehouseConfirmation {
    invoiceId: string;
    countCatalogue: string;
    faktur: string;

    constructor(data: IWarehouseConfirmation) {
        const { invoiceId, countCatalogue, faktur } = data;

        this.invoiceId = invoiceId || undefined;
        this.countCatalogue = countCatalogue;
        this.faktur = faktur ? String(faktur).trim() : null;
    }

    clear(): WarehouseConfirmation {
        return new WarehouseConfirmation(undefined);
    }
}
