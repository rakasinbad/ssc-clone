import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp, Timestamp } from 'app/shared/models/timestamp.model';

export interface IPrivilege extends ITimestamp {
    id: string;
    privilege: string;
}

export class Privilege extends Timestamp {
    id: string;
    privilege: string;

    constructor(
        id: string,
        privilege: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.privilege = privilege;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
