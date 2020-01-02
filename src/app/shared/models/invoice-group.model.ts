import { EStatus, TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';

export interface IInvoiceGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    minimumOrder: string;
    status: EStatus;
    supplierId: string;
}

export class InvoiceGroup implements IInvoiceGroup {
    readonly id: NonNullable<string>;
    name: string;
    minimumOrder: string;
    status: EStatus;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: InvoiceGroup) {
        const {
            id,
            name,
            minimumOrder,
            status,
            supplierId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.name = name ? String(name).trim() : null;
        this.minimumOrder = minimumOrder;
        this.status = status;
        this.supplierId = supplierId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
