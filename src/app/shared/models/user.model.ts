import { UserStore } from 'app/main/pages/accounts/merchants/models';

import { TNullable } from './global.model';
import { Portfolio } from './portfolio.model';
import { Role } from './role.model';
import { UserSupplier } from './supplier.model';
import { ITimestamp } from './timestamp.model';
import { Urban } from './urban.model';
import { Team } from './team.model';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BANNED = 'banned'
}

export interface IUser extends ITimestamp {
    readonly id: NonNullable<string>;
    attendances?: any;
    email: TNullable<string>;
    fullName: string;
    idImageUrl: TNullable<string>;
    idNo: string;
    imageUrl: TNullable<string>;
    joinDate?: string;
    mobilePhoneNo: string;
    phoneNo: TNullable<string>;
    portfolios?: Array<Portfolio>;
    roles: Array<Role>;
    saleTeam: Team;
    saleTeamId: string;
    selfieImageUrl: TNullable<string>;
    status: UserStatus;
    taxImageUrl: TNullable<string>;
    taxNo: string;
    totalActualSales?: number;
    totalTargetSales?: number;
    urban?: Urban;
    urbanId: string;
    userStores?: Array<UserStore>;
    userSuppliers?: Array<UserSupplier>;
}

export class User implements IUser {
    readonly id: NonNullable<string>;
    attendances?: any;
    email: TNullable<string>;
    fullName: string;
    idImageUrl: TNullable<string>;
    idNo: string;
    imageUrl: TNullable<string>;
    joinDate?: string;
    mobilePhoneNo: string;
    phoneNo: TNullable<string>;
    portfolios?: Array<Portfolio>;
    roles: Array<Role>;
    saleTeam: Team;
    saleTeamId: string;
    selfieImageUrl: TNullable<string>;
    status: UserStatus;
    taxImageUrl: TNullable<string>;
    taxNo: string;
    totalActualSales?: number;
    totalTargetSales?: number;
    urban?: Urban;
    urbanId: string;
    userStores?: Array<UserStore>;
    userSuppliers?: Array<UserSupplier>;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IUser) {
        const {
            id,
            attendances,
            email,
            fullName,
            idImageUrl,
            idNo,
            imageUrl,
            joinDate,
            mobilePhoneNo,
            phoneNo,
            portfolios,
            roles,
            saleTeam,
            saleTeamId,
            selfieImageUrl,
            status = UserStatus.INACTIVE,
            taxImageUrl,
            taxNo,
            totalActualSales,
            totalTargetSales,
            urban,
            urbanId,
            userStores,
            userSuppliers,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.attendances = attendances;
        this.email = email ? String(email).trim() : null;
        this.fullName = fullName ? String(fullName).trim() : null;
        this.idImageUrl = idImageUrl ? String(idImageUrl).trim() : null;
        this.idNo = idNo ? String(idNo).trim() : null;
        this.imageUrl = imageUrl ? String(imageUrl).trim() : null;
        this.joinDate = joinDate;
        this.mobilePhoneNo = mobilePhoneNo ? String(mobilePhoneNo).trim() : null;
        this.phoneNo = phoneNo ? String(phoneNo).trim() : null;
        this.saleTeamId = saleTeamId;
        this.selfieImageUrl = selfieImageUrl ? String(selfieImageUrl).trim() : null;
        this.setPortfolios = portfolios;
        this.setRoles = roles;
        this.setSaleTeam = saleTeam;
        this.setUserStores = userStores;
        this.setUserSuppliers = userSuppliers;
        this.status = status;
        this.taxImageUrl = taxImageUrl ? String(taxImageUrl).trim() : null;
        this.taxNo = taxNo ? String(taxNo).trim() : null;
        this.totalActualSales = totalActualSales;
        this.totalTargetSales = totalTargetSales;
        this.urban = urban;
        this.urbanId = urbanId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setPortfolios(value: Array<Portfolio>) {
        if (value && value.length > 0) {
            this.portfolios = value.map(row => new Portfolio(row));
        } else {
            this.portfolios = [];
        }
    }

    set setRoles(value: Array<Role>) {
        if (value && value.length > 0) {
            this.roles = value.map(row => new Role(row));
        } else {
            this.roles = [];
        }
    }

    set setSaleTeam(value: Team) {
        this.saleTeam = value ? new Team(value) : null;
    }

    set setUserStores(value: Array<UserStore>) {
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

    set setUserSuppliers(value: Array<UserSupplier>) {
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
