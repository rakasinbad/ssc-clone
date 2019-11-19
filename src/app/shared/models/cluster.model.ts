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
    private _supplier?: Supplier;

    constructor(
        private _id: string,
        private _name: string,
        private _supplierId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this._name = _name ? _name.trim() : null;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get supplierId(): string {
        return this._supplierId;
    }

    get supplier(): Supplier {
        return this._supplier;
    }

    set supplier(value: Supplier) {
        this._supplier = value
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
