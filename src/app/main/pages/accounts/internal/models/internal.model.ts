import {
    IResponsePaginate,
    ITimestamp,
    Role,
    Timestamp,
    TNullable,
    TStatus,
    TUserStatus
} from 'app/shared/models';
import * as _ from 'lodash';

export interface IInternalEmployee extends ITimestamp {
    id: string;
    userId: string;
    brandId: string;
    status: TStatus;
    user: User;
}

export interface IInternalEmployeeDetail extends ITimestamp {
    id: string;
    fullName: string;
    email: string;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: TUserStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    roles: Role[];
}

export interface IInternalEmployeeResponse extends IResponsePaginate {
    data: IInternalEmployee[];
}

export class InternalEmployee extends Timestamp {
    id: string;
    userId: string;
    brandId: string;
    status: TStatus;
    user: User;

    constructor(
        id: string,
        userId: string,
        brandId: string,
        status: TStatus,
        user: User,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.userId = userId;
        this.brandId = brandId;
        this.status = status;
        this.user = user
            ? new User(
                  user.id,
                  user.fullName,
                  user.email,
                  user.phoneNo,
                  user.mobilePhoneNo,
                  user.idNo,
                  user.taxNo,
                  user.status,
                  user.imageUrl,
                  user.taxImageUrl,
                  user.idImageUrl,
                  user.selfieImageUrl,
                  user.urbanId,
                  user.roles,
                  user.createdAt,
                  user.updatedAt,
                  user.deletedAt
              )
            : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class InternalEmployeeDetail extends Timestamp {
    id: string;
    fullName: string;
    email: string;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: TUserStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    roles: Role[];

    constructor(
        id: string,
        fullName: string,
        email: string,
        phoneNo: TNullable<string>,
        mobilePhoneNo: string,
        idNo: string,
        taxNo: string,
        status: TUserStatus,
        imageUrl: TNullable<string>,
        taxImageUrl: TNullable<string>,
        idImageUrl: TNullable<string>,
        selfieImageUrl: TNullable<string>,
        roles: Role[],
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.fullName = fullName ? fullName.trim() : fullName;
        this.email = email ? email.trim() : email;
        this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
        this.mobilePhoneNo = mobilePhoneNo ? mobilePhoneNo.trim() : mobilePhoneNo;
        this.idNo = idNo;
        this.taxNo = taxNo;
        this.status = status;
        this.imageUrl = imageUrl;
        this.taxImageUrl = taxImageUrl;
        this.idImageUrl = idImageUrl;
        this.selfieImageUrl = selfieImageUrl;

        if (roles && roles.length > 0) {
            roles = roles.map(role => {
                return new Role(
                    role.id,
                    role.role,
                    role.description,
                    role.status,
                    role.roleTypeId,
                    role.createdAt,
                    role.updatedAt,
                    role.deletedAt
                );
            });

            this.roles = _.sortBy(roles, ['role'], ['asc']);
        } else {
            this.roles = [];
        }
    }
}

class User extends Timestamp {
    id: string;
    fullName: string;
    email: string;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: TUserStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    urbanId: string;
    roles: Role[];

    constructor(
        id: string,
        fullName: string,
        email: string,
        phoneNo: TNullable<string>,
        mobilePhoneNo: string,
        idNo: string,
        taxNo: string,
        status: TUserStatus,
        imageUrl: TNullable<string>,
        taxImageUrl: TNullable<string>,
        idImageUrl: TNullable<string>,
        selfieImageUrl: TNullable<string>,
        urbanId: string,
        roles: Role[],
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.fullName = fullName ? fullName.trim() : fullName;
        this.email = email ? email.trim() : email;
        this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
        this.mobilePhoneNo = mobilePhoneNo ? mobilePhoneNo.trim() : mobilePhoneNo;
        this.idNo = idNo;
        this.taxNo = taxNo;
        this.status = status;
        this.imageUrl = imageUrl;
        this.taxImageUrl = taxImageUrl;
        this.idImageUrl = idImageUrl;
        this.selfieImageUrl = selfieImageUrl;
        this.urbanId = urbanId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.roles =
            roles && roles.length > 0
                ? roles.map(row => {
                      return new Role(
                          row.id,
                          row.role,
                          row.description,
                          row.status,
                          row.roleTypeId,
                          row.createdAt,
                          row.updatedAt,
                          row.deletedAt
                      );
                  })
                : [];
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
