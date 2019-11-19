import { TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IStoreGroup extends ITimestamp {
    id: string;
    name: string;
}

export class StoreGroup extends Timestamp implements IStoreGroup {
    constructor(
        private _id: string,
        private _name: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this._name = _name ? _name.trim() : null;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }
}
