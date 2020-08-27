import { ITimestamp } from 'app/shared/models/timestamp.model';

import { Supplier } from './supplier.model';
import { User } from './user.model';

export interface ISalesRep extends ITimestamp {
    id: string;
    userId: string;
    supplierId: string;
    status: string;
    supplier: Supplier;
    user: User;
}

export class SalesRep implements ISalesRep {
    id: string;
    userId: string;
    supplierId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    supplier: Supplier;
    user: User;

    constructor(data: ISalesRep) {
        const {
            id,
            userId,
            supplierId,
            status,
            createdAt,
            updatedAt,
            deletedAt,
            supplier,
            user,
        } = data;

        this.id = id;
        this.userId = userId;
        this.supplierId = supplierId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setSupplier = supplier;
        this.setUser = user;
    }

    set setSupplier(value: Supplier) {
        this.supplier = value;
    }

    set setUser(value: User) {
        this.user = value;
    }
}
