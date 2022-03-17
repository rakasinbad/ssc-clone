// import { any } from 'app/main/pages/accounts/merchants/models';

import { TNullable } from './global.model';
import { InvoiceGroup } from './invoice-group.model';
import { ITimestamp } from './timestamp.model';
import { User } from './user.model';

export interface IPortfolio extends ITimestamp {
    readonly id: NonNullable<string>;
    actualTargetSales?: number;
    associated?: any;
    code: string;
    invoiceGroup: InvoiceGroup;
    invoiceGroupId: string;
    name: string;
    portfolioHistories?: any;
    portfolioStore?: any;
    storeQty?: number;
    totalStore?: number;
    totalActualSales?: number;
    totalTargetSales?: number;
    type: string;
    user?: User;
    userId: string;
}

export class Portfolio implements IPortfolio {
    readonly id: NonNullable<string>;
    actualTargetSales?: number;
    associated?: any;
    code: string;
    invoiceGroup: InvoiceGroup;
    invoiceGroupId: string;
    name: string;
    portfolioHistories?: any;
    portfolioStore?: any;
    storeQty?: number;
    totalStore?: number;
    totalActualSales?: number;
    totalTargetSales?: number;
    type: string;
    user?: User;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IPortfolio) {
        const {
            id,
            actualTargetSales,
            associated,
            code,
            invoiceGroup,
            invoiceGroupId,
            name,
            portfolioHistories,
            portfolioStore,
            storeQty,
            totalStore,
            totalActualSales,
            totalTargetSales,
            type,
            user,
            userId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.actualTargetSales = actualTargetSales;
        this.associated = associated;
        this.code = code ? String(code).trim() : null;
        this.invoiceGroupId = invoiceGroupId;
        this.name = name ? String(name).trim() : null;
        this.setInvoiceGroup = invoiceGroup;
        this.setPortfolioStore = portfolioStore;
        this.setUser = user;
        this.storeQty = storeQty;
        this.totalStore = totalStore;
        this.totalActualSales = totalActualSales;
        this.totalTargetSales = totalTargetSales;
        this.type = type;
        this.userId = userId;
        this.portfolioHistories = portfolioHistories;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setInvoiceGroup(value: InvoiceGroup) {
        this.invoiceGroup = value ? new InvoiceGroup(value) : null;
    }

    set setPortfolioStore(value: any) {
        this.portfolioStore = value ? value : null;
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }
}
