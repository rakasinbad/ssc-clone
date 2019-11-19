import { IResponsePaginate, TNullable, TStatus } from './global.model';
import { Privilege } from './privilege.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IRole extends ITimestamp {
    id: string;
    role: string;
    description: string;
    status: TStatus;
    roleTypeId: string;
    privileges?: Privilege[];
}

export interface IRoleResponse extends IResponsePaginate {
    data: Role[];
}

export class Role extends Timestamp implements IRole {
    private _privileges?: Privilege[];

    constructor(
        private _id: string,
        private _role: string,
        private _description: string,
        private _status: TStatus,
        private _roleTypeId: string,
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

    get role(): string {
        return this._role;
    }

    set role(value: string) {
        this._role = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get status(): TStatus {
        return this._status;
    }

    set status(value: TStatus) {
        this._status = value;
    }

    get roleTypeId(): string {
        return this._roleTypeId;
    }

    set roleTypeId(value: string) {
        this._roleTypeId = value;
    }

    get privileges(): Privilege[] {
        return this._privileges;
    }

    set privileges(value: Privilege[]) {
        this._privileges = value;
    }
}
