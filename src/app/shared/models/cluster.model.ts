import { TNullable } from './global.model';
import { Supplier } from './supplier.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface ICluster extends ITimestamp {
    id: string;
    name: string;
    supplierId: string;
    supplier?: Supplier;
}

export class Cluster extends Timestamp implements ICluster {
    public supplier?: Supplier;

    constructor(
        public id: string,
        public name: string,
        public supplierId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
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
