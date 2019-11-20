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
        public id: string,
        public privilege: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.privilege = privilege ? privilege.trim() : null;
    }
}
