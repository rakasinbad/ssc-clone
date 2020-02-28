import { TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';

export interface IWarehouseValue extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    supplierId: string;
}

export class WarehouseValue implements IWarehouseValue {
    readonly id: NonNullable<string>;
    name: string;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IWarehouseValue) {
        const { id, name, supplierId, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.name = name ? String(name).trim() : null;
        this.supplierId = supplierId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
