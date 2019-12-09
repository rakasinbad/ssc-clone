import { TNullable } from './global.model';
import { Supplier } from './supplier.model';
import { ITimestamp } from './timestamp.model';

interface ICluster extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    supplierId: string;
    supplier?: Supplier;
}

export class Cluster implements ICluster {
    readonly id: NonNullable<string>;
    name: string;
    supplierId: string;
    supplier?: Supplier;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: Cluster) {
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
        this.supplier = value
            ? new Supplier(
                  value.id,
                  value.name,
                  value.longitude,
                  value.latitude,
                  value.phoneNo,
                  value.status,
                  value.urbanId,
                  value.createdAt,
                  value.updatedAt,
                  value.deletedAt
              )
            : null;
    }
}
