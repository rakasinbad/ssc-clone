import { UserStore } from 'app/main/pages/accounts/merchants/models';

import { TNullable } from './global.model';
import { Role } from './role.model';
import { UserSupplier } from './supplier.model';
import { ITimestamp, Timestamp } from './timestamp.model';
import { Urban } from './urban.model';

enum UserStatus {
    active,
    inactive,
    banned
}

type UserStatusString = keyof typeof UserStatus;

export type TUserStatus = UserStatusString;

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
    userStores?: UserStore[];
    userSuppliers?: UserSupplier[];
    urban?: Urban;
    roles: Role[];
    attendances?: any;
}

export class User extends Timestamp implements IUser {
    private _userStores?: UserStore[];
    private _userSuppliers?: UserSupplier[];
    private _urban?: Urban;
    private _attendances?: any;

    constructor(
        private _id: string,
        private _fullName: string,
        private _email: TNullable<string>,
        private _phoneNo: TNullable<string>,
        private _mobilePhoneNo: string,
        private _idNo: string,
        private _taxNo: string,
        private _status: TUserStatus,
        private _imageUrl: TNullable<string>,
        private _taxImageUrl: TNullable<string>,
        private _idImageUrl: TNullable<string>,
        private _selfieImageUrl: TNullable<string>,
        private _urbanId: string,
        private _roles: Role[],
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        if (_roles && _roles.length > 0) {
            const newRoles = _roles.map(row => {
                const newRole = new Role(
                    row.id,
                    row.role,
                    row.description,
                    row.status,
                    row.roleTypeId,
                    row.createdAt,
                    row.updatedAt,
                    row.deletedAt
                );

                if (row.privileges) {
                    newRole.privileges = row.privileges;
                }

                return newRole;
            });

            this._roles = newRoles;
        } else {
            this._roles = null;
        }
    }

    get id(): string {
        return this._id;
    }

    get fullName(): string {
        return this._fullName;
    }

    get email(): string {
        return this._email;
    }

    get phoneNo(): string {
        return this._phoneNo;
    }

    get mobilePhoneNo(): string {
        return this._mobilePhoneNo;
    }

    get idNo(): string {
        return this._idNo;
    }

    get taxNo(): string {
        return this._taxNo;
    }

    get status(): TUserStatus {
        return this._status;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get taxImageUrl(): string {
        return this._taxImageUrl;
    }

    get idImageUrl(): string {
        return this._idImageUrl;
    }

    get selfieImageUrl(): string {
        return this._selfieImageUrl;
    }

    get urbanId(): string {
        return this._urbanId;
    }

    get userStores(): UserStore[] {
        return this._userStores;
    }

    set userStores(value: UserStore[]) {
        this._userStores = value;
    }

    get userSuppliers(): UserSupplier[] {
        return this._userSuppliers;
    }

    set userSuppliers(value: UserSupplier[]) {
        this._userSuppliers = value;
    }

    get urban(): Urban {
        return this._urban;
    }

    set urban(value: Urban) {
        this._urban = value;
    }

    get roles(): Role[] {
        return this._roles;
    }

    get attendances(): any {
        return this._attendances;
    }

    set attendances(value: any) {
        this._attendances = value;
    }
}
