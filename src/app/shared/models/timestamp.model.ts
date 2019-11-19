import { TNullable } from './global.model';

export interface ITimestamp {
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export class Timestamp implements ITimestamp {
    constructor(
        private _createdAt: string,
        private _updatedAt: string,
        private _deletedAt: TNullable<string>
    ) {}

    get createdAt(): string {
        return this._createdAt;
    }

    set createdAt(value: string) {
        this._createdAt = value;
    }

    get updatedAt(): string {
        return this._updatedAt;
    }

    set updatedAt(value: string) {
        this._updatedAt = value;
    }

    get deletedAt(): TNullable<string> {
        return this._deletedAt;
    }

    set deletedAt(value: TNullable<string>) {
        this._deletedAt = value;
    }
}
