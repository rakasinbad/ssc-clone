import { TNullable } from './global.model';
import { InvoiceGroup } from './invoice-group.model';
import { ITimestamp } from './timestamp.model';

export interface IPortfolio extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    code: string;
    invoiceGroupId: string;
    userId: string;
    invoiceGroup: InvoiceGroup;
}

export class Portfolio implements IPortfolio {
    readonly id: NonNullable<string>;
    name: string;
    code: string;
    invoiceGroupId: string;
    userId: string;
    invoiceGroup: InvoiceGroup;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IPortfolio) {
        const {
            id,
            name,
            code,
            invoiceGroupId,
            userId,
            invoiceGroup,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.name = name ? String(name).trim() : null;
        this.code = code ? String(code).trim() : null;
        this.invoiceGroupId = invoiceGroupId;
        this.userId = userId;
        this.setInvoiceGroup = invoiceGroup;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setInvoiceGroup(value: InvoiceGroup) {
        this.invoiceGroup = value ? new InvoiceGroup(value) : null;
    }
}
