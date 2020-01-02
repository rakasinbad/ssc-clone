import { IResponsePaginate, TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';

export interface IPrivilege extends ITimestamp {
    readonly id: NonNullable<string>;
    privilege: string;
}

export interface IPrivilegeResponse extends IResponsePaginate {
    data: Privilege[];
}

export class Privilege implements IPrivilege {
    readonly id: NonNullable<string>;
    privilege: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IPrivilege) {
        const { id, privilege, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.privilege = privilege ? String(privilege).trim() : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
