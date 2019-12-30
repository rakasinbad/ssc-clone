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

        this.supplier = supplier
            ? new Supplier(
                  supplier.id,
                  supplier.name,
                  supplier.longitude,
                  supplier.latitude,
                  supplier.phoneNo,
                  supplier.status,
                  supplier.urbanId,
                  supplier.createdAt,
                  supplier.updatedAt,
                  supplier.deletedAt
              )
            : supplier;

        this.user = user
            ? new User(
                  user.id,
                  user.fullName,
                  user.email,
                  user.phoneNo,
                  user.mobilePhoneNo,
                  user.idNo,
                  user.taxNo,
                  user.status,
                  user.imageUrl,
                  user.taxImageUrl,
                  user.idImageUrl,
                  user.selfieImageUrl,
                  user.urbanId,
                  user.roles,
                  user.createdAt,
                  user.updatedAt,
                  user.deletedAt
              )
            : user;
    }
}
