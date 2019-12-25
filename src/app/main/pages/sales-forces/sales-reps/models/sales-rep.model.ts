import { EStatus, ITimestamp, Supplier, TNullable, User } from 'app/shared/models';

export interface ISalesRep extends ITimestamp {
    readonly id: NonNullable<string>;
    userId: string;
    supplierId: string;
    status: EStatus;
    supplier: Supplier;
    user: User;
}

export class SalesRep implements ISalesRep {
    readonly id: NonNullable<string>;
    userId: string;
    supplierId: string;
    status: EStatus;
    supplier: Supplier;
    user: User;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: ISalesRep) {
        const {
            id,
            userId,
            supplierId,
            status = EStatus.INACTIVE,
            supplier,
            user,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.userId = userId;
        this.supplierId = supplierId;
        this.status = status;
        this.supplier = supplier;
        this.user = user;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setSupplier(value: Supplier) {
        this.supplier = value ? new Supplier(value) : null;
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }
}
