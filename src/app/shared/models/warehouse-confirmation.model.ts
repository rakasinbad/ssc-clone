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
}

export interface IWarehouseConfirmation {
    countCatalogue: string;
    faktur: string;
}
