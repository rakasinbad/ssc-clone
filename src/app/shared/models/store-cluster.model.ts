import { TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

export interface IStoreCluster extends ITimestamp {
    id?: string;
    name: string;
}

export interface IStoreClusterResponse extends ITimestamp {
    data: IStoreCluster[];
}

export class StoreCluster extends Timestamp {
    id?: string;
    name: string;

    constructor(
        name: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>,
        id?: string
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.name = name ? name.trim() : name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
