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
    totalTargetSales?: number;
    totalActualSales?: number;
    totalStore?: number;
}

export class Portfolio implements IPortfolio {
    readonly id: NonNullable<string>;
    name: string;
    code: string;
    invoiceGroupId: string;
    userId: string;
    invoiceGroup: InvoiceGroup;
    totalTargetSales?: number;
    totalActualSales?: number;
    totalStore?: number;
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
            totalTargetSales,
            totalActualSales,
            totalStore,
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
        this.totalTargetSales = totalTargetSales;
        this.totalActualSales = totalActualSales;
        this.totalStore = totalStore;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setInvoiceGroup(value: InvoiceGroup) {
        this.invoiceGroup = value ? new InvoiceGroup(value) : null;
    }
}
