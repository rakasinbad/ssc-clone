import { ITimestamp } from 'app/shared/models/timestamp.model';

import { Role } from './role.model';

export interface IUser extends ITimestamp {
    id: string;
    fullName: string;
    email: string;
    phoneNo: string;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    joinDate: string;
    userCode: string;
    status: string;
    imageUrl: string;
    taxImageUrl: string;
    idImageUrl: string;
    selfieImageUrl: string;
    urbanId: string;
    saleTeamId: string;
    roles: Array<Role>;
}

export class User implements IUser {
    id: string;
    fullName: string;
    email: string;
    phoneNo: string;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    joinDate: string;
    userCode: string;
    status: string;
    imageUrl: string;
    taxImageUrl: string;
    idImageUrl: string;
    selfieImageUrl: string;
    urbanId: string;
    saleTeamId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    roles: Array<Role>;

    constructor(data: IUser) {
        const {
            id,
            fullName,
            email,
            phoneNo,
            mobilePhoneNo,
            idNo,
            taxNo,
            joinDate,
            userCode,
            status,
            imageUrl,
            taxImageUrl,
            idImageUrl,
            selfieImageUrl,
            urbanId,
            saleTeamId,
            createdAt,
            updatedAt,
            deletedAt,
            roles = [],
        } = data;

        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNo = phoneNo;
        this.mobilePhoneNo = mobilePhoneNo;
        this.idNo = idNo;
        this.taxNo = taxNo;
        this.joinDate = joinDate;
        this.userCode = userCode;
        this.status = status;
        this.imageUrl = imageUrl;
        this.taxImageUrl = taxImageUrl;
        this.idImageUrl = idImageUrl;
        this.selfieImageUrl = selfieImageUrl;
        this.urbanId = urbanId;
        this.saleTeamId = saleTeamId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setRoles = roles;
    }

    set setRoles(value: Array<Role>) {
        this.roles = Array.isArray(value) ? value.map(v => new Role(v)) : [];
    }
}
