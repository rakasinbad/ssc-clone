import { Timestamp, TNullable, TStatus } from 'app/shared/models';

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
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
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
