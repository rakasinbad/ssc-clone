import { TNullable } from './global.model';
import { InvoiceGroup } from './invoice-group.model';
import { ITimestamp } from './timestamp.model';

export interface IWarehouseInvoiceGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    invoiceGroup: InvoiceGroup;
    invoiceGroupId: string;
    warehouseId: string;
}

export class WarehouseInvoiceGroup implements IWarehouseInvoiceGroup {
    readonly id: NonNullable<string>;
    invoiceGroup: InvoiceGroup;
    invoiceGroupId: string;
    warehouseId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IWarehouseInvoiceGroup) {
        const {
            id,
            invoiceGroup,
            invoiceGroupId,
            warehouseId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.invoiceGroupId = invoiceGroupId;
        this.warehouseId = warehouseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setInvoiceGroup = invoiceGroup;
    }

    set setInvoiceGroup(value: InvoiceGroup) {
        this.invoiceGroup = value ? new InvoiceGroup(value) : value;
    }
}
