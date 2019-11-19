import { TNullable, TStatus } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IStoreConfig extends ITimestamp {
    id: string;
    startingWorkHour: string;
    finishedWorkHour: string;
    status: TStatus;
    storeId: string;
}

export class StoreConfig extends Timestamp implements IStoreConfig {
    constructor(
        private _id: string,
        private _startingWorkHour: string,
        private _finishedWorkHour: string,
        private _status: TStatus,
        private _storeId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    get id(): string {
        return this._id;
    }

    get startingWorkHour(): string {
        return this._startingWorkHour;
    }

    get finishedWorkHour(): string {
        return this._finishedWorkHour;
    }

    get status(): TStatus {
        return this._status;
    }

    get storeId(): string {
        return this._storeId;
    }
}
