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
    countCatalogue: string;
    faktur: string;
}

export class WarehouseConfirmation implements IWarehouseConfirmation {
    countCatalogue: string;
    faktur: string;

    constructor(data: IWarehouseConfirmation) {
        const { countCatalogue, faktur } = data;

        this.countCatalogue = countCatalogue;
        this.faktur = faktur ? String(faktur).trim() : null;
    }

    clear(): WarehouseConfirmation {
        return new WarehouseConfirmation(undefined);
    }
}
