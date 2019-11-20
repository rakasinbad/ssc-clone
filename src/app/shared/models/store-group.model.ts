import { TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IStoreGroup extends ITimestamp {
    id: string;
    name: string;
}

export class StoreGroup extends Timestamp implements IStoreGroup {
    constructor(
        public id: string,
        public name: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
    }
}
