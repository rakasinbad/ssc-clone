import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

export interface IStoreGroup extends ITimestamp {
    id: string;
    name: string;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export class StoreGroup implements IStoreGroup {
    id: string;
    name: string;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreGroup) {
        const {
            id, name, supplierId, createdAt, updatedAt, deletedAt
        } = data;

        this.id = id;
        this.name = name;
        this.supplierId = supplierId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
