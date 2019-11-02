import { TNullable } from './global.model';

export class Timestamp {
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(createdAt: string, updatedAt: string, deletedAt: TNullable<string>) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export interface ITimestamp {
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}
