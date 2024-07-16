import { ITimestamp } from 'app/shared/models/timestamp.model';
import { Role } from './role.model';
import { Portfolio } from './portfolio.model';
import { UserSupplier } from './user-supplier.model';



export interface ISalesRep extends ITimestamp {
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
    totalTargetSales: number;
    storeQty: number;
    roles: Array<Role>;
    portfolios: Array<Portfolio>;
    userSuppliers: Array<UserSupplier>;
}

export class SalesRep implements ISalesRep {
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
    totalTargetSales: number;
    storeQty: number;
    roles: Array<Role>;
    portfolios: Array<Portfolio>;
    userSuppliers: Array<UserSupplier>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: ISalesRep) {
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
            totalTargetSales,
            storeQty,
            roles,
            portfolios,
            userSuppliers,
            createdAt,
            updatedAt,
            deletedAt,
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
        this.totalTargetSales = totalTargetSales;
        this.storeQty = storeQty;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setRoles = roles;
        this.setPortfolios = portfolios;
        this.setUserSuppliers = userSuppliers;
    }

    set setRoles(value: Array<Role>) {
        this.roles = Array.isArray(value) ? value.map(v => new Role(v)) : [];
    }

    set setPortfolios(value: Array<Portfolio>) {
        this.portfolios = Array.isArray(value) ? value.map(v => new Portfolio(v)) : [];
    }

    set setUserSuppliers(value: Array<UserSupplier>) {
        this.userSuppliers = Array.isArray(value) ? value.map(v => new UserSupplier(v)) : [];
    }
}
