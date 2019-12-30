import { ITimestamp, TNullable, User, InvoiceGroup, Supplier } from 'app/shared/models';

type TStatusType = 'active' | 'inactive';

interface IAssociation extends ITimestamp {
    id: string;
    userId: string;
    supplierId: string;
    status: TStatusType;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    supplier: Supplier;
    user: User;
}

export class Association implements IAssociation {
    id: string;
    userId: string;
    supplierId: string;
    status: TStatusType;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    supplier: Supplier;
    user: User;

    constructor(data: IAssociation) {
        const { id, supplierId, userId, createdAt, updatedAt, deletedAt, supplier, user } = data;

        this.id = id;
        this.supplierId = supplierId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.supplier = supplier ? new Supplier(supplier) : supplier;

        this.user = user ? new User(user) : user;
    }
}
