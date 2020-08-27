import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IInvoiceGroup extends ITimestamp {
    id: string;
    code: string;
    name: string;
    minimumOrder: number;
    status: string;
    externalId: string;
    supplierId: string;
}

export class InvoiceGroup implements IInvoiceGroup {
    id: string;
    code: string;
    name: string;
    minimumOrder: number;
    status: string;
    externalId: string;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: IInvoiceGroup) {
        const {
            id,
            code,
            name,
            minimumOrder,
            status,
            externalId,
            supplierId,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.code = code;
        this.name = name;
        this.minimumOrder = minimumOrder;
        this.status = status;
        this.externalId = externalId;
        this.supplierId = supplierId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
