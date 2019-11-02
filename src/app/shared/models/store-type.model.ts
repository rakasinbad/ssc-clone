import { TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

export interface IStoreType extends ITimestamp {
    id?: string;
    name: string;
}

export interface IStoreTypeResponse extends ITimestamp {
    data: IStoreType[];
}

export class StoreType extends Timestamp {
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
