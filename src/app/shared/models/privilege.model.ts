import { IResponsePaginate, TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

export interface IPrivilege extends ITimestamp {
    id: string;
    privilege: string;
}

export interface IPrivilegeResponse extends IResponsePaginate {
    data: Privilege[];
}

export class Privilege extends Timestamp implements IPrivilege {
    constructor(
        private _id: string,
        private _privilege: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get privilege(): string {
        return this._privilege;
    }

    set privilege(value: string) {
        this._privilege = value;
    }
}
