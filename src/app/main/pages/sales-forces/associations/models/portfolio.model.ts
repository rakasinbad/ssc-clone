import { ITimestamp } from 'app/shared/models/timestamp.model';

import { Associated } from './associated.model';
import { InvoiceGroup } from './invoice-group.model';
import { User } from './user.model';
import { Warehouse } from './warehouse.model';
import { PortfolioHistory } from './portfolio-history.model';

export interface IPortfolio extends ITimestamp {
    id: string;
    name: string;
    code: string;
    type: string;
    warehouseId: string;
    invoiceGroupId: string;
    userId: string;
    warehouse: Warehouse;
    user: User;
    invoiceGroup: InvoiceGroup;
    totalTargetSales: number;
    actualTargetSales: number;
    storeQty: number;
    associated: Array<Associated>;
    portfolioHistories: Array<PortfolioHistory>;
}

export class Portfolio implements IPortfolio {
    id: string;
    name: string;
    code: string;
    type: string;
    warehouseId: string;
    invoiceGroupId: string;
    userId: string;
    warehouse: Warehouse;
    user: User;
    invoiceGroup: InvoiceGroup;
    totalTargetSales: number;
    actualTargetSales: number;
    storeQty: number;
    associated: Array<Associated>;
    portfolioHistories: Array<PortfolioHistory>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: IPortfolio) {
        const {
            id,
            name,
            code,
            type,
            warehouseId,
            invoiceGroupId,
            userId,
            warehouse,
            user,
            invoiceGroup,
            totalTargetSales,
            actualTargetSales,
            storeQty,
            associated,
            portfolioHistories,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.name = name;
        this.code = code;
        this.type = type;
        this.warehouseId = warehouseId;
        this.invoiceGroupId = invoiceGroupId;
        this.userId = userId;
        this.totalTargetSales = totalTargetSales;
        this.actualTargetSales = actualTargetSales;
        this.storeQty = storeQty;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setAssociated = associated;
        this.setInvoiceGroup = invoiceGroup;
        this.setPortfolioHistories = portfolioHistories;
        this.setUser = user;
        this.setWarehouse = warehouse;
    }

    set setAssociated(value: Array<Associated>) {
        this.associated = Array.isArray(value) ? value.map(v => new Associated(v)) : [];
    }

    set setInvoiceGroup(value: InvoiceGroup) {
        this.invoiceGroup = !value ? null : new InvoiceGroup(value);
    }

    set setPortfolioHistories(value: Array<PortfolioHistory>) {
        this.portfolioHistories = Array.isArray(value) ? value.map(v => new PortfolioHistory(v)) : [];
    }

    set setUser(value: User) {
        this.user = !value ? null : new User(value);
    }

    set setWarehouse(value: Warehouse) {
        this.warehouse = !value ? null : new Warehouse(value);
    }
}
