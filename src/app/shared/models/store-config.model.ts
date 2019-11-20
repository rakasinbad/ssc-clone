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
        public id: string,
        public startingWorkHour: string,
        public finishedWorkHour: string,
        public status: TStatus,
        public storeId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }
}
