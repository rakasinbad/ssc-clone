import {
    ITimestamp,
    TNullable,
    TUserStatus,
} from 'app/shared/models';

interface IUser extends ITimestamp {
    id: string;
    fullName: string;
    email: TNullable<string>;
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
}

export class User implements IUser {
    id: string;
    fullName: string;
    email: TNullable<string>;
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
            status = 'inactive',
            imageUrl,
            taxImageUrl,
            idImageUrl,
            selfieImageUrl,
            urbanId,
            createdAt,
            updatedAt,
            deletedAt,
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