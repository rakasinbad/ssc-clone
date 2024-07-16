import { ITimestamp } from 'app/shared/models/timestamp.model';
import { UserRoles } from './user-roles.model';

export interface IRole extends ITimestamp {
    id: string;
    role: string;
    description: string;
    status: string;
    roleTypeId: string;
    user_roles: Array<UserRoles>;
}

export class Role implements IRole {
    id: string;
    role: string;
    description: string;
    status: string;
    roleTypeId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    // tslint:disable-next-line: variable-name
    user_roles: Array<UserRoles>;

    constructor(data: IRole) {
        const {
            id,
            role,
            description,
            status,
            roleTypeId,
            createdAt,
            updatedAt,
            deletedAt,
            user_roles,
        } = data;

        this.id = id;
        this.role = role;
        this.description = description;
        this.status = status;
        this.roleTypeId = roleTypeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        
        this.setUserRoles = user_roles;
    }

    set setUserRoles(value: Array<UserRoles>) {
        this.user_roles = Array.isArray(value) ? value.map(v => new UserRoles(v)) : [];
    }
}
