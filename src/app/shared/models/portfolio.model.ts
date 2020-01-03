import { StorePortfolio } from 'app/main/pages/accounts/merchants/models';
import { InvoiceGroup, ITimestamp, TNullable } from 'app/shared/models';

import { User } from './user.model';

export interface IPortfolio extends ITimestamp {
    readonly id: NonNullable<string>;
    actualTargetSales?: number;
    associated?: any;
    code: string;
    invoiceGroup: InvoiceGroup;
    invoiceGroupId: string;
    name: string;
    portfolioStore?: StorePortfolio;
    storeQty?: number;
    totalStore?: number;
    totalTargetSales?: number;
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
    portfolioStore?: StorePortfolio;
    storeQty?: number;
    totalStore?: number;
    totalTargetSales?: number;
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
            portfolioStore,
            storeQty,
            totalStore,
            totalTargetSales,
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
        this.totalTargetSales = totalTargetSales;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setInvoiceGroup(value: InvoiceGroup) {
        this.invoiceGroup = value ? new InvoiceGroup(value) : null;
    }

    set setPortfolioStore(value: StorePortfolio) {
        this.portfolioStore = value ? new StorePortfolio(value) : null;
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }
}
