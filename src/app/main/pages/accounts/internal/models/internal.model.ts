import { IResponsePaginate, ITimestamp, Timestamp, TNullable, TStatus } from 'app/shared/models';

import { TAccountStatus } from '../../models';

export interface IInternalEmployee extends ITimestamp {
    id: string;
    userId: string;
    brandId: string;
    status: TStatus;
    user: User;
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
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.userId = userId;
        this.brandId = brandId;
        this.status = status;
        this.user = user
            ? {
                  ...new User(
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
                      user.createdAt,
                      user.updatedAt,
                      user.deletedAt
                  )
              }
            : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
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
    status: TAccountStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    urbanId: string;

    constructor(
        id: string,
        fullName: string,
        email: string,
        phoneNo: TNullable<string>,
        mobilePhoneNo: string,
        idNo: string,
        taxNo: string,
        status: TAccountStatus,
        imageUrl: TNullable<string>,
        taxImageUrl: TNullable<string>,
        idImageUrl: TNullable<string>,
        selfieImageUrl: TNullable<string>,
        urbanId: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
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
