import { JSONSchema } from '@ngx-pwa/local-storage';
import { IResponsePaginate, TNullable } from 'app/shared/models/global.model';
import { ITimestamp, Timestamp } from 'app/shared/models/timestamp.model';
import * as _ from 'lodash';

import { AttendanceAssocUser } from '../../attendances/models/attendance.model';
import { Role } from '../../roles/role.model';
import { StoreAssocUser } from '../../stores/models/store.model';
import { Urban } from '../../urbans/models';

enum AccountStatus {
    active,
    inactive,
    banned
}

type AccountStatusString = keyof typeof AccountStatus;

export type TAccountStatus = AccountStatusString;

export interface IAccount extends ITimestamp {
    id: string;
    fullName: string;
    email?: TNullable<string>;
    phoneNo?: TNullable<string>;
    mobilePhoneNo: string;
    status: TAccountStatus;
    imageUrl?: TNullable<string>;
    urbanId?: string;
    userOdooId?: string;
    userStores?: StoreAssocUser[];
    roles?: Role[];
    attendances?: AttendanceAssocUser[];
    urban: Urban;
}

export interface IAccountResponse extends IResponsePaginate {
    data: IAccount[];
}

export const accountSchema: JSONSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        fullname: { type: 'string' },
        email: { type: 'string' },
        phoneNo: { type: 'string' },
        mobilePhoneNo: { type: 'string' },
        fcm: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive', 'banned'] },
        image: { type: 'string' },
        urbanId: { type: 'string' },
        userOdooId: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        deletedAt: { type: 'string' },
        userStores: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'inactive'] },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    deletedAt: { type: 'string' },
                    store: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            address: { type: 'string' },
                            longitude: { type: 'number' },
                            latitude: { type: 'number' },
                            largeArea: { type: 'string' },
                            phoneNo: { type: 'string' },
                            status: { type: 'string', enum: ['active', 'inactive'] },
                            parent: { type: 'boolean' },
                            parentId: { type: 'string' },
                            storeTypeId: { type: 'string' },
                            storeGroupId: { type: 'string' },
                            storeSegmentId: { type: 'string' },
                            urbanId: { type: 'string' },
                            warehouseId: { type: 'string' },
                            createdAt: { type: 'string' },
                            updatedAt: { type: 'string' },
                            deletedAt: { type: 'string' },
                            storeConfig: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    startingWorkHour: { type: 'string' },
                                    finishedWorkHour: { type: 'string' },
                                    status: { type: 'string', enum: ['active', 'inactive'] },
                                    createdAt: { type: 'string' },
                                    updatedAt: { type: 'string' },
                                    deletedAt: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        },
        roles: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    role: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'inactive'] },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    deletedAt: { type: 'string' },
                    privileges: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                privilege: { type: 'string' },
                                createdAt: { type: 'string' },
                                updatedAt: { type: 'string' },
                                deletedAt: { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        attendances: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    checkDate: { type: 'string' },
                    longitude: { type: 'number' },
                    latitude: { type: 'number' },
                    checkIn: { type: 'string' },
                    checkOut: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    deletedAt: { type: 'string' }
                }
            }
        }
    }
};

export class Account extends Timestamp {
    id: string;
    fullName: string;
    email?: TNullable<string>;
    phoneNo?: TNullable<string>;
    mobilePhoneNo: string;
    status: TAccountStatus;
    imageUrl: TNullable<string>;
    urbanId?: string;
    userOdooId?: string;
    userStores?: StoreAssocUser[];
    roles?: Role[];
    attendances?: AttendanceAssocUser[];
    urban: Urban;

    constructor(
        id: string,
        fullName: string,
        email: TNullable<string>,
        phoneNo: TNullable<string>,
        mobilePhoneNo: string,
        status: TAccountStatus,
        imageUrl: TNullable<string>,
        urbanId: string,
        userOdooId: string,
        userStores: StoreAssocUser[],
        roles: Role[],
        attendances: AttendanceAssocUser[],
        urban: Urban,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.fullName = fullName;
        this.email = email;
        this.phoneNo = phoneNo;
        this.mobilePhoneNo = mobilePhoneNo;
        this.status = status;
        this.imageUrl = imageUrl || 'assets/images/avatars/profile.jpg';
        this.urbanId = urbanId;
        this.userOdooId = userOdooId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        if (userStores && userStores.length > 0) {
            userStores = [
                ...userStores.map(userStore => {
                    return {
                        ...new StoreAssocUser(
                            userStore.id,
                            userStore.status,
                            userStore.store,
                            userStore.createdAt,
                            userStore.updatedAt,
                            userStore.deletedAt
                        )
                    };
                })
            ];
            this.userStores = _.orderBy(userStores, item => item.store.name, 'asc');
        } else {
            this.userStores = [];
        }

        if (roles && roles.length > 0) {
            roles = [
                ...roles.map(role => {
                    return {
                        ...new Role(
                            role.id,
                            role.role,
                            role.description,
                            role.status,
                            role.privileges,
                            role.createdAt,
                            role.updatedAt,
                            role.deletedAt
                        )
                    };
                })
            ];
            this.roles = _.sortBy(roles, ['role'], ['asc']);
        } else {
            this.roles = [];
        }

        if (attendances && attendances.length > 0) {
            attendances = [
                ...attendances.map(attendance => {
                    return {
                        ...new AttendanceAssocUser(
                            attendance.id,
                            attendance.checkDate,
                            attendance.longitude,
                            attendance.latitude,
                            attendance.checkIn,
                            attendance.checkOut,
                            attendance.createdAt,
                            attendance.updatedAt,
                            attendance.deletedAt
                        )
                    };
                })
            ];
            this.attendances = _.orderBy(attendances, item => item.checkIn, 'desc');
        } else {
            this.attendances = [];
        }

        if (urban) {
            this.urban = {
                ...new Urban(
                    urban.id,
                    urban.zipCode,
                    urban.city,
                    urban.district,
                    urban.urban,
                    urban.provinceId,
                    urban.province,
                    urban.createdAt,
                    urban.updatedAt,
                    urban.deletedAt
                )
            };
        } else {
            this.urban = null;
        }

        // if (account) {
        //     this.id = account.id || '';
        //     this.fullName = account.fullname || '';
        //     this.email = account.email || '';
        //     this.phoneNo = account.phoneNo || '';
        //     this.mobilePhoneNo = account.mobilePhoneNo || '';
        //     this.fcm = account.fcm || '';
        //     this.avatar = 'assets/images/avatars/profile.jpg';
        //     this.status = account.status || null;
        //     // account = account || {};
        //     // this.id = account.id || FuseUtils.generateGUID();
        //     // this.fullname = account.fullname || '';
        //     // this.email = account.email || '';
        //     // this.phone = account.phone || '';
        //     // this.mobilePhone = account.mobilePhoneNo || '';
        //     // this.fcm = account.fcm || '';
        //     // this.avatar = account.avatar || 'assets/images/avatars/profile.jpg';
        //     // this.status = account.status || '';

        //     if (account.roles) {
        //         this.roles = _.sortBy(account.roles, ['role'], ['asc']) || [];
        //     } else {
        //         this.roles = [];
        //     }

        //     this.userStores = _.orderBy(account.userStores, item => item.store.name, 'asc') || [];
        //     this.attendances = _.orderBy(account.attendances, item => item.checkIn, 'desc') || [];
        // }
    }
}

export class AccountAssocAttendance extends Timestamp {
    id: string;
    fullname: string;
    email?: TNullable<string>;
    phoneNo?: TNullable<string>;
    mobilePhoneNo: string;
    fcm?: TNullable<string>;
    status: TAccountStatus;
    image: TNullable<string>;
    urbanId?: string;
    userOdooId?: string;
    userStores?: StoreAssocUser[];
    roles?: Role[];

    constructor(
        id: string,
        fullname: string,
        email: TNullable<string>,
        phoneNo: TNullable<string>,
        mobilePhoneNo: string,
        fcm: TNullable<string>,
        status: TAccountStatus,
        image: TNullable<string>,
        urbanId: string,
        userOdooId: string,
        userStores: StoreAssocUser[],
        roles: Role[],
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.fullname = fullname;
        this.email = email;
        this.phoneNo = phoneNo;
        this.mobilePhoneNo = mobilePhoneNo;
        this.fcm = fcm;
        this.status = status;
        this.image = image || 'assets/images/avatars/profile.jpg';
        this.urbanId = urbanId;
        this.userOdooId = userOdooId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        if (userStores && userStores.length > 0) {
            userStores = [
                ...userStores.map(userStore => {
                    return {
                        ...new StoreAssocUser(
                            userStore.id,
                            userStore.status,
                            userStore.store,
                            userStore.createdAt,
                            userStore.updatedAt,
                            userStore.deletedAt
                        )
                    };
                })
            ];
            this.userStores = _.orderBy(userStores, item => item.store.name, 'asc');
        } else {
            this.userStores = [];
        }

        if (roles && roles.length > 0) {
            roles = [
                ...roles.map(role => {
                    return {
                        ...new Role(
                            role.id,
                            role.role,
                            role.description,
                            role.status,
                            role.privileges,
                            role.createdAt,
                            role.updatedAt,
                            role.deletedAt
                        )
                    };
                })
            ];
            this.roles = _.sortBy(roles, ['role'], ['asc']);
        } else {
            this.roles = [];
        }
    }
}
