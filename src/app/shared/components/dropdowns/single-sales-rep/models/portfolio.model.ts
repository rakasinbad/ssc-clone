import { ITimestamp } from 'app/shared/models/timestamp.model';

import { InvoiceGroup } from './invoice-group.model';

export interface IPortfolio extends ITimestamp {
    id: string;
    name: string;
    code: string;
    type: string;
    warehouseId: string;
    invoiceGroupId: string;
    userId: string;
    invoiceGroup: InvoiceGroup;
}

export class Portfolio implements IPortfolio {
    id: string;
    name: string;
    code: string;
    type: string;
    warehouseId: string;
    invoiceGroupId: string;
    userId: string;
    invoiceGroup: InvoiceGroup;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: IPortfolio) {
        const {
            id,
            name,
            code,
            type,
            warehouseId,
            invoiceGroupId,
            userId,
            invoiceGroup,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.name = name;
        this.code = code;
        this.type = type;
        this.warehouseId = warehouseId;
        this.invoiceGroupId = invoiceGroupId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setInvoiceGroup = invoiceGroup;
    }

    set setInvoiceGroup(value: InvoiceGroup) {
        this.invoiceGroup = new InvoiceGroup(value);
    }
}
