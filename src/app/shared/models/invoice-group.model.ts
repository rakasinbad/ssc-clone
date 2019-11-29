import { EStatus, TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IInvoiceGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    minimumOrder: string;
    status: EStatus;
    supplierId: string;
}

export class InvoiceGroup extends Timestamp implements IInvoiceGroup {
    constructor(
        public readonly id: NonNullable<string>,
        public name: string,
        public minimumOrder: string,
        public status: EStatus,
        public supplierId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
    }
}
