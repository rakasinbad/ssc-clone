import { TNullable, TStatus } from './global.model';
import { Timestamp } from './timestamp.model';

export class Legal extends Timestamp {
    id: string;
    fullName: string;
    email: string;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: TNullable<string>;
    taxNo: TNullable<string>;
    status: TStatus;
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
        idNo: TNullable<string>,
        taxNo: TNullable<string>,
        status: TStatus,
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
        this.idNo = idNo ? idNo.trim() : idNo;
        this.taxNo = taxNo ? taxNo.trim() : taxNo;
        this.status = status;
        this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
        this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : taxImageUrl;
        this.idImageUrl = idImageUrl ? idImageUrl.trim() : idImageUrl;
        this.selfieImageUrl = selfieImageUrl ? selfieImageUrl.trim() : selfieImageUrl;
        this.urbanId = urbanId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
