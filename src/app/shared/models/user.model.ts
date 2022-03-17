// import { UserStore } from 'app/main/pages/accounts/merchants/models';

import { TNullable } from './global.model';
import { Urban } from './location.model';
import { Portfolio } from './portfolio.model';
import { Role } from './role.model';
import { UserSupplier } from './supplier.model';
import { Team } from './team.model';
import { ITimestamp } from './timestamp.model';
import { UserBank } from './bank.model';
import { HelperService } from '../helpers';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BANNED = 'banned'
}

export interface IUser extends ITimestamp {
    readonly id: NonNullable<string>;
    userCode?: TNullable<string>;
    attendances?: any;
    email: TNullable<string>;
    isEmailVerified: boolean;
    isMobilePhoneNoVerified: boolean;
    fullName: string;
    idImageUrl: TNullable<string>;
    idNo: string;
    imageUrl: TNullable<string>;
    joinDate?: string;
    mobilePhoneNo: string;
    phoneNo: TNullable<string>;
    portfolios?: Array<Portfolio>;
    roles?: Array<Role>;
    bank?: UserBank;
    saleTeam?: Team;
    saleTeamId?: string;
    selfieImageUrl: TNullable<string>;
    status: UserStatus;
    taxImageUrl: TNullable<string>;
    taxNo: string;
    totalActualSales?: number;
    totalTargetSales?: number;
    urban?: Urban;
    urbanId: string;
    userStores?: Array<any>;
    userSuppliers?: Array<UserSupplier>;
    lastAssociated?: TNullable<string>;
    storeQty?: number;
}

export class User implements IUser {
    readonly id: NonNullable<string>;
    userCode?: TNullable<string>;
    attendances?: any;
    email: TNullable<string>;
    isEmailVerified: boolean;
    isMobilePhoneNoVerified: boolean;
    fullName: string;
    idImageUrl: TNullable<string>;
    idNo: string;
    imageUrl: TNullable<string>;
    joinDate?: string;
    mobilePhoneNo: string;
    phoneNo: TNullable<string>;
    portfolios?: Array<Portfolio>;
    roles?: Array<Role>;
    bank?: UserBank;
    saleTeam?: Team;
    saleTeamId?: string;
    selfieImageUrl: TNullable<string>;
    status: UserStatus;
    taxImageUrl: TNullable<string>;
    taxNo: string;
    totalActualSales?: number;
    totalTargetSales?: number;
    urban?: Urban;
    urbanId: string;
    userStores?: Array<any>;
    userSuppliers?: Array<UserSupplier>;
    lastAssociated?: TNullable<string>;
    storeQty?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IUser) {
        const {
            id,
            userCode,
            attendances,
            email,
            isEmailVerified,
            fullName,
            idImageUrl,
            idNo,
            imageUrl,
            joinDate,
            mobilePhoneNo,
            isMobilePhoneNoVerified,
            phoneNo,
            portfolios,
            roles,
            bank,
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
            storeQty = 0,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.userCode = userCode;
        this.attendances = attendances;
        this.email = email ? String(email).trim() : null;
        this.isEmailVerified = isEmailVerified;
        this.fullName = fullName ? String(fullName).trim() : null;
        this.idImageUrl = idImageUrl ? String(idImageUrl).trim() : null;
        this.idNo = idNo ? String(idNo).trim() : null;
        this.imageUrl = imageUrl ? String(imageUrl).trim() : null;
        this.joinDate = joinDate;
        this.mobilePhoneNo = mobilePhoneNo ? String(mobilePhoneNo).trim() : null;
        this.isMobilePhoneNoVerified = isMobilePhoneNoVerified;
        this.phoneNo = phoneNo ? String(phoneNo).trim() : null;
        this.saleTeamId = saleTeamId;
        this.selfieImageUrl = selfieImageUrl ? String(selfieImageUrl).trim() : null;
        this.setPortfolios = portfolios;
        this.lastAssociated =
            Array.isArray(portfolios) && portfolios.length > 0
                ? portfolios.sort((a, b) => +a.id - +b.id).pop().createdAt
                : null;
        this.storeQty = +storeQty;
        this.setRoles = roles;
        this.setUserBank = bank;
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

    set setUserBank(value: UserBank) {
        this.bank = value ? new UserBank(value) : null;
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

    set setUserStores(value: Array<any>) {
        this.userStores =
            value && value.length > 0
                ? value.map(row => {
                      const newUserStore = value;

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
