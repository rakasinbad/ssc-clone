import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IUserRoles extends ITimestamp {
    userId: string;
    roleId: string;
}

export class UserRoles implements IUserRoles {
    userId: string;
    roleId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: IUserRoles) {
        const {
            userId,
            roleId,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.userId = userId;
        this.roleId = roleId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
