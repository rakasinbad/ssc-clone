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
    public userStores?: UserStore[];
    public userSuppliers?: UserSupplier[];
    public urban?: Urban;
    public attendances?: any;

    constructor(
        public id: string,
        public fullName: string,
        public email: TNullable<string>,
        public phoneNo: TNullable<string>,
        public mobilePhoneNo: string,
        public idNo: string,
        public taxNo: string,
        public status: TUserStatus,
        public imageUrl: TNullable<string>,
        public taxImageUrl: TNullable<string>,
        public idImageUrl: TNullable<string>,
        public selfieImageUrl: TNullable<string>,
        public urbanId: string,
        public roles: Role[],
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.fullName = fullName ? fullName.trim() : null;
        this.email = email ? email.trim() : null;
        this.phoneNo = phoneNo ? phoneNo.trim() : null;
        this.idNo = idNo ? idNo.trim() : null;
        this.taxNo = taxNo ? taxNo.trim() : null;
        this.imageUrl = imageUrl ? imageUrl.trim() : null;
        this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : null;
        this.idImageUrl = idImageUrl ? idImageUrl.trim() : null;
        this.selfieImageUrl = selfieImageUrl ? selfieImageUrl.trim() : null;

        if (roles && roles.length > 0) {
            const newRoles = roles.map(row => {
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
                    newRole.setPrivileges = row.privileges;
                }

                return newRole;
            });

            this.roles = newRoles;
        } else {
            this.roles = [];
        }
    }

    set setUserStores(value: UserStore[]) {
        this.userStores =
            value && value.length > 0
                ? value.map(row => {
                      const newUserStore = new UserStore(
                          row.id,
                          row.userId,
                          row.storeId,
                          row.status,
                          row.createdAt,
                          row.updatedAt,
                          row.deletedAt
                      );

                      if (row.store) {
                          newUserStore.setStore = row.store;
                      }

                      return newUserStore;
                  })
                : [];
    }

    set setUserSuppliers(value: UserSupplier[]) {
        this.userSuppliers =
            value && value.length > 0
                ? value.map(row => {
                      const newUserSupplier = new UserSupplier(
                          row.id,
                          row.userId,
                          row.supplierId,
                          row.status,
                          row.supplier,
                          row.createdAt,
                          row.updatedAt,
                          row.deletedAt
                      );

                      if (row.user) {
                          newUserSupplier.setUser = row.user;
                      }

                      return newUserSupplier;
                  })
                : [];
    }

    set setUrban(value: Urban) {
        this.urban = value ? new Urban(value) : null;
    }

    set setAttendances(value: any) {
        this.attendances = value;
    }

    get userSupplier(): TNullable<UserSupplier> {
        if (this.userSuppliers.length === 0) {
            return null;
        }

        return this.userSuppliers[0];
    }

    static patch(body: UserOptions): UserOptions {
        return body;
    }
}

export type UserOptions = Partial<User>;
