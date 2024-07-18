import { IResponsePaginate, TNullable, TStatus } from 'app/shared/models/global.model';
import { Role } from 'app/shared/models/role.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { User, UserStatus } from 'app/shared/models/user.model';
import { sortBy } from 'lodash';

export interface IInternalEmployee extends ITimestamp {
    readonly id: NonNullable<string>;
    userId: string;
    brandId: string;
    status: TStatus;
    user: User;
}

export interface IInternalEmployeeResponse extends IResponsePaginate {
    data: IInternalEmployee[];
}

export class InternalEmployee implements IInternalEmployee {
    readonly id: NonNullable<string>;
    userId: string;
    brandId: string;
    status: TStatus;
    user: User;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IInternalEmployee) {
        const { id, userId, brandId, status, user, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.userId = userId;
        this.brandId = brandId;
        this.status = status;
        this.setUser = user;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }
}

export interface IInternalEmployeeDetail extends ITimestamp {
    readonly id: NonNullable<string>;
    fullName: string;
    email: string;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: UserStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    roles: Role[];
}

export class InternalEmployeeDetail implements IInternalEmployeeDetail {
    readonly id: NonNullable<string>;
    fullName: string;
    email: string;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: UserStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    roles: Role[];
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IInternalEmployeeDetail) {
        const {
            id,
            fullName,
            email,
            phoneNo,
            mobilePhoneNo,
            idNo,
            taxNo,
            status,
            imageUrl,
            taxImageUrl,
            idImageUrl,
            selfieImageUrl,
            roles,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.fullName = fullName ? String(fullName).trim() : null;
        this.email = email ? String(email).trim() : null;
        this.phoneNo = phoneNo ? String(phoneNo).trim() : null;
        this.mobilePhoneNo = mobilePhoneNo ? String(mobilePhoneNo).trim() : null;
        this.idNo = idNo ? String(idNo).trim() : null;
        this.taxNo = taxNo ? String(taxNo).trim() : null;
        this.status = status;
        this.imageUrl = imageUrl ? String(imageUrl).trim() : null;
        this.taxImageUrl = taxImageUrl ? String(taxImageUrl).trim() : null;
        this.idImageUrl = idImageUrl ? String(idImageUrl).trim() : null;
        this.selfieImageUrl = selfieImageUrl ? String(selfieImageUrl).trim() : null;
        this.setRoles = roles;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setRoles(value: Role[]) {
        if (value && value.length > 0) {
            const newRoles = value.map(row => new Role(row));

            this.roles = sortBy(newRoles, ['role'], ['asc']);
        } else {
            this.roles = [];
        }
    }
}

// -----------------------------------------------------------------------------------------------------
// For Demo
// -----------------------------------------------------------------------------------------------------

export interface IInternalDemo {
    id: string;
    user: string;
    email: string;
    role: string;
    phoneNumber: string;
}
