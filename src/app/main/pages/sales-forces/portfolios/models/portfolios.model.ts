import { ITimestamp, TNullable, User, InvoiceGroup, TSource } from 'app/shared/models';
import { Store } from '.';

type TPortfolioType = 'multi' | 'single';

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
    source?: 'fetch' | 'list';
}

interface IPortfolioStore {
    storeId: number;
    target: number;
}

export interface IPortfolioAddForm {
    name: string;
    type: 'direct' | 'group';
    invoiceGroupId: string;
    stores: Array<IPortfolioStore>;
    removedStore?: Array<{ storeId: string; portfolioId: string; }>;
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
    isSelected?: boolean;
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
            stores,
            source = 'fetch'
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
        this.source = source;

        this.stores = Array.isArray(stores) && stores.length > 0 ? stores.map(store => new Store(store)) : stores;

        this.user = user ? new User(user) : user;

        this.invoiceGroup = invoiceGroup ? new InvoiceGroup(invoiceGroup) : invoiceGroup;
    }
}
