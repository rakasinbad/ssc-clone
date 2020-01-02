import { ITimestamp } from './timestamp.model';
import { Supplier } from './supplier.model';
import { TNullable } from './global.model';

export interface ITeam extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    supplierId: string;
    supplier?: Supplier;
}

export class Team implements ITeam {
    readonly id: NonNullable<string>;
    name: string;
    supplierId: string;
    supplier?: Supplier;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: ITeam) {
        const { id, name, supplierId, supplier, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.name = name ? String(name).trim() : null;
        this.supplierId = supplierId;
        this.setSupplier = supplier;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setSupplier(value: Supplier) {
        this.supplier = value ? new Supplier(value) : null;
    }
}
