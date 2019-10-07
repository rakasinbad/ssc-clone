import { IResponsePaginate, TNullable, TStatus } from 'app/shared/models/global.model';
import { ITimestamp, Timestamp } from 'app/shared/models/timestamp.model';
import * as _ from 'lodash';

import { Privilege } from '../privileges/privilege.model';

export interface IRole extends ITimestamp {
    id: string;
    role: string;
    description: string;
    status: TStatus;
    privileges: Privilege[];
}

export interface IRoleResponse extends IResponsePaginate {
    data: Role[];
}

export class Role extends Timestamp {
    id: string;
    role: string;
    description: string;
    status: TStatus;
    privileges: Privilege[];

    constructor(
        id: string,
        role: string,
        description: string,
        status: TStatus,
        privileges: Privilege[],
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.role = role;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        if (privileges && privileges.length > 0) {
            privileges = [
                ...privileges.map(privilege => {
                    return {
                        ...new Privilege(
                            privilege.id,
                            privilege.privilege,
                            privilege.createdAt,
                            privilege.updatedAt,
                            privilege.deletedAt
                        )
                    };
                })
            ];
            this.privileges = _.sortBy(privileges, ['privilege'], ['asc']);
        } else {
            this.privileges = null;
        }
    }
}
