import { StorePortfolio } from 'app/main/pages/accounts/merchants/models';
import { TNullable } from 'app/shared/models/global.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { User } from 'app/shared/models/user.model';

import { Portfolio } from '../../portfolios/models';

type TStatusType = 'active' | 'inactive';

export interface IAssociation extends ITimestamp {
    id: string;
    name: string;
    code: string;
    type: string;
    invoiceGroupId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    invoiceGroup: InvoiceGroup;
    user: User;
    user_id: string;
    storePortfolios: StorePortfolio;
    storeQty: string;
    portfolios: Array<Portfolio>;
    lastAssociated?: string;
    totalTargetSales: number;
    actualTargetSales: number;
}

export interface IAssociationForm {
    userId: number;
    invoiceGroupId: number;
    portfolioId: Array<number>;
    deletePortfolio?: Array<number>;
    storeId?: Array<number>;
    deleteStore?: Array<number>;
}

export class Association implements IAssociation {
    id: string;
    name: string;
    code: string;
    type: string;
    invoiceGroupId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    invoiceGroup: InvoiceGroup;
    user: User;
    user_id: string;
    storePortfolios: StorePortfolio;
    storeQty: string;
    portfolios: Array<Portfolio>;
    lastAssociated?: string;
    totalTargetSales: number;
    actualTargetSales: number;

    constructor(data: IAssociation) {
        const {
            id,
            name,
            code,
            type,
            invoiceGroup,
            userId,
            createdAt,
            updatedAt,
            deletedAt,
            user,
            user_id,
            storePortfolios,
            storeQty,
            portfolios = [],
            lastAssociated,
            totalTargetSales,
            actualTargetSales
        } = data;

        this.id = id;
        this.name = name;
        this.code = code;
        this.type = type;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.user_id = user_id;
        this.totalTargetSales = totalTargetSales;
        this.storeQty = storeQty;
        this.actualTargetSales = actualTargetSales;
        this.portfolios =
            Array.isArray(portfolios) && portfolios.length > 0
                ? portfolios.map(portfolio => new Portfolio(portfolio))
                : portfolios;
        this.storePortfolios = storePortfolios
            ? new StorePortfolio(storePortfolios)
            : storePortfolios;

        this.invoiceGroup = invoiceGroup ? new InvoiceGroup(invoiceGroup) : invoiceGroup;

        this.user = user ? new User(user) : user;
    }
}
