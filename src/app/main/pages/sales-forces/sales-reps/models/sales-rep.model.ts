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
        this.setSupplier = supplier;
        this.setUser = user;
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

type AddForm = 'fullName' | 'mobilePhoneNo' | 'idNo' | 'status';

interface ISalesRepForm {
    image: string;
    supplierId: string;
    password: string;
    confPassword: string;
}

export type SalesRepForm = Required<Pick<User, AddForm> & ISalesRepForm>;
