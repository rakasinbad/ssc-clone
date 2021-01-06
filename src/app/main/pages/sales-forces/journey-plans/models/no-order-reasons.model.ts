import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface INoOrderReasons extends ITimestamp {
    readonly id: NonNullable<string>;
    reason: string;
}

export class NoOrderReasons implements INoOrderReasons {
    readonly id: NonNullable<string>;
    reason: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: INoOrderReasons) {
        const {
            id,
            reason,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.reason = reason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
