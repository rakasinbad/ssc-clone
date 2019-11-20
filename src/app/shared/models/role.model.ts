import { sortBy } from 'lodash';

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
    public privileges?: Privilege[];

    constructor(
        public id: string,
        public role: string,
        public description: string,
        public status: TStatus,
        public roleTypeId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.role = role ? role.trim() : null;
        this.description = description ? description.trim() : null;
    }

    set setPrivileges(value: Privilege[]) {
        if (value && value.length > 0) {
            const newPrivileges = value.map(row => {
                return new Privilege(
                    row.id,
                    row.privilege,
                    row.createdAt,
                    row.updatedAt,
                    row.deletedAt
                );
            });

            this.privileges = sortBy(newPrivileges, ['privilege'], ['asc']);
        } else {
            this.privileges = [];
        }
    }
}
