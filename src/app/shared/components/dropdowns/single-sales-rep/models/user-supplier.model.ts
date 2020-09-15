import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IUserSupplier extends ITimestamp {
    id: string;
    userId: string;
    supplierId: string;
    status: string;
}

export class UserSupplier implements IUserSupplier {
    id: string;
    userId: string;
    supplierId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: IUserSupplier) {
        const {
            id,
            userId,
            supplierId,
            status,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.userId = userId;
        this.supplierId = supplierId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
