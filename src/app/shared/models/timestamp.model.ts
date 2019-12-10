import { TNullable } from './global.model';

export interface ITimestamp {
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    fetchedAt?: string;
}

export class Timestamp implements ITimestamp {
    constructor(
        public createdAt: string,
        public updatedAt: string,
        public deletedAt: TNullable<string>
    ) {}
}
