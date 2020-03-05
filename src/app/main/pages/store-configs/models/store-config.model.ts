import { TNullable, TStatus } from 'app/shared/models/global.model';
import { Timestamp } from 'app/shared/models/timestamp.model';

export class StoreConfig extends Timestamp {
    id: string;
    startingWorkHour: string;
    finishedWorkHour: string;
    status: TStatus;

    constructor(
        id: string,
        startingWorkHour: string,
        finishedWorkHour: string,
        status: TStatus,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.startingWorkHour = startingWorkHour;
        this.finishedWorkHour = finishedWorkHour;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
