import { Store } from 'app/main/pages/accounts/merchants/models';
import { TNullable } from 'app/shared/models/global.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { User } from 'app/shared/models/user.model';
import { Warehouse } from './warehouse.model';

export type TPortfolioType = 'group' | 'direct';

interface StorePortfolio {
    id: string;
    portfolioId: string;
    storeId: string;
    store: Store;
    target: number;
    createdAt: string;
    updatedAt: string;
}

interface IPortfolio extends ITimestamp {
    id: string;
    name: string;
    type: TPortfolioType;
    invoiceGroupId: string;
    code: string;
    userId: TNullable<string>;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    user: TNullable<User>;
    invoiceGroup: TNullable<InvoiceGroup>;
    storeQty?: number;
    isSelected?: boolean;
    stores?: Array<Store>;
    storePortfolios: Array<StorePortfolio>;
    warehouse?: Warehouse;
    totalTargetSales?: number;
    actualTargetSales?: number;
    source?: 'fetch' | 'list';
}

interface IPortfolioStore {
    storeId: number;
    target: number;
}

export interface IPortfolioAddForm {
    name: string;
    type: 'direct' | 'group';
    invoiceGroupId?: string;
    warehouseId: string;
    stores: Array<IPortfolioStore>;
    removedStore?: Array<{ storeId: string; portfolioId: string }>;
}

export class Portfolio implements IPortfolio {
    id: string;
    name: string;
    type: TPortfolioType;
    invoiceGroupId: string;
    code: string;
    userId: TNullable<string>;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    user: TNullable<User>;
    invoiceGroup: TNullable<InvoiceGroup>;
    storeQty?: number;
    stores?: Array<Store>;
    storePortfolios: Array<StorePortfolio>;
    warehouse?: Warehouse;
    isSelected?: boolean;
    totalTargetSales?: number;
    actualTargetSales?: number;
    source?: 'fetch' | 'list';

    constructor(data: IPortfolio) {
        const {
            id,
            invoiceGroupId,
            userId,
            name,
            code,
            type,
            createdAt,
            updatedAt,
            deletedAt,
            user = null,
            invoiceGroup = null,
            storeQty = 0,
            isSelected = false,
            stores = [],
            storePortfolios = [],
            warehouse = {},
            source = 'fetch',
            totalTargetSales,
            actualTargetSales
        } = data;

        this.id = id;
        this.invoiceGroupId = invoiceGroupId;
        this.userId = userId;
        this.name = name;
        this.code = code;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.storeQty = storeQty;
        this.isSelected = isSelected;
        this.actualTargetSales = actualTargetSales;
        this.totalTargetSales = totalTargetSales;
        this.source = source;
        this.warehouse = !warehouse || Object.keys(warehouse).length === 0 ? warehouse as Warehouse : new Warehouse(warehouse as Warehouse);

        this.stores =
            Array.isArray(stores) && stores.length > 0
                ? stores.map(store => new Store(store))
                : stores;

        this.storePortfolios = storePortfolios;

        this.user = user ? new User(user) : user;

        this.invoiceGroup = invoiceGroup ? new InvoiceGroup(invoiceGroup) : invoiceGroup;
    }
}
