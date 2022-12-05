import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { UserStatus } from 'app/shared/models/user.model';

interface IUser extends ITimestamp {
    id: string;
    fullName: string;
    email: TNullable<string>;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: UserStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    urbanId: string;
}

export interface IUserResponseUpdatePassword {
    success: boolean;
    message: string;
}

export class User implements IUser {
    id: string;
    fullName: string;
    email: TNullable<string>;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: UserStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    urbanId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(user: User) {
        const {
            id,
            fullName,
            email,
            phoneNo,
            mobilePhoneNo,
            idNo,
            taxNo,
            status = UserStatus.INACTIVE,
            imageUrl,
            taxImageUrl,
            idImageUrl,
            selfieImageUrl,
            urbanId,
            createdAt,
            updatedAt,
            deletedAt
        } = user;

        this.id = id ? id.trim() : id;
        this.fullName = fullName ? fullName.trim() : fullName;
        this.email = email ? email.trim() : email;
        this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
        this.mobilePhoneNo = mobilePhoneNo ? mobilePhoneNo.trim() : mobilePhoneNo;
        this.idNo = idNo ? idNo.trim() : idNo;
        this.taxNo = taxNo ? taxNo.trim() : taxNo;
        this.status = status;
        this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
        this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : taxImageUrl;
        this.idImageUrl = idImageUrl ? idImageUrl.trim() : idImageUrl;
        this.selfieImageUrl = selfieImageUrl ? selfieImageUrl.trim() : selfieImageUrl;
        this.urbanId = urbanId ? urbanId.trim() : urbanId;
        this.createdAt = createdAt ? createdAt.trim() : createdAt;
        this.updatedAt = updatedAt ? updatedAt.trim() : updatedAt;
        this.deletedAt = deletedAt ? deletedAt.trim() : deletedAt;
    }
}

export class UpdateUser extends User {
    userId: string;
    image?: string;
    password: string;
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}
