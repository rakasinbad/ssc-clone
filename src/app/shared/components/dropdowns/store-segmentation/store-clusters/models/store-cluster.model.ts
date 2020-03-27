import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

export interface IStoreCluster extends ITimestamp {
    id: string;
    name: string;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export class StoreCluster implements IStoreCluster {
    id: string;
    name: string;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreCluster) {
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
