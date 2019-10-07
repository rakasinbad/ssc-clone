import { TNullable } from './global.model';

export class Timestamp {
    createdAt: TNullable<string>;
    updatedAt: TNullable<string>;
    deletedAt: TNullable<string>;

    constructor(
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export interface ITimestamp {
    createdAt: TNullable<string>;
    updatedAt: TNullable<string>;
    deletedAt: TNullable<string>;
}
