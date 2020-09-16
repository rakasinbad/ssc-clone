import { ITimestamp } from 'app/shared/models/timestamp.model';

import { Portfolio } from './portfolio.model';
import { Role } from './role.model';
import { SaleTeam } from './sale-team.model';
import { Urban } from './urban.model';

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
    saleTeam: SaleTeam;
    urban: Urban;
    portfolios: Array<Portfolio>;
    totalTargetSales: number;
    totalActualSales: number;
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
    saleTeam: SaleTeam;
    urban: Urban;
    portfolios: Array<Portfolio>;
    totalTargetSales: number;
    totalActualSales: number;

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
            roles,
            saleTeam,
            urban,
            portfolios,
            totalTargetSales,
            totalActualSales,
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
        this.totalTargetSales = totalTargetSales;
        this.totalActualSales = totalActualSales;

        this.setPortfolios = portfolios;
        this.setRoles = roles;
        this.setSaleTeam = saleTeam;
        this.setUrban = urban;
    }

    set setPortfolios(value: Array<Portfolio>) {
        this.portfolios = Array.isArray(value) ? value.map(v => new Portfolio(v)) : [];
    }
    
    set setRoles(value: Array<Role>) {
        this.roles = Array.isArray(value) ? value.map(v => new Role(v)) : [];
    }

    set setSaleTeam(value: SaleTeam) {
        this.saleTeam = new SaleTeam(value);
    }

    set setUrban(value: Urban) {
        this.urban = new Urban(value);
    }
}
