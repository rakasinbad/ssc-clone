import { sortBy } from 'lodash';

import { EStatus, IResponsePaginate, TNullable } from './global.model';
import { Privilege } from './privilege.model';
import { ITimestamp } from './timestamp.model';

export interface IRole extends ITimestamp {
    readonly id: NonNullable<string>;
    role: string;
    description: string;
    status: EStatus;
    roleTypeId: string;
    privileges?: Privilege[];
}

export interface IRoleResponse extends IResponsePaginate {
    data: Role[];
}

export class Role implements IRole {
    readonly id: NonNullable<string>;
    role: string;
    description: string;
    status: EStatus;
    roleTypeId: string;
    privileges?: Privilege[];
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IRole) {
        const {
            id,
            role,
            description,
            status,
            roleTypeId,
            privileges,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.role = role ? String(role).trim() : null;
        this.description = description ? String(description).trim() : null;
        this.status = status;
        this.roleTypeId = roleTypeId;
        this.setPrivileges = privileges;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setPrivileges(value: Privilege[]) {
        if (value && value.length > 0) {
            const newPrivileges = value.map(row => new Privilege(row));

            this.privileges = sortBy(newPrivileges, ['privilege'], ['asc']);
        } else {
            this.privileges = [];
        }
    }
}
