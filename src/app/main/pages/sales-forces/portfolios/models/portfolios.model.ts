import { ITimestamp, TNullable, User, InvoiceGroup } from 'app/shared/models';

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

        this.user = user ? new User(user) : user;

        this.invoiceGroup = invoiceGroup ? new InvoiceGroup(invoiceGroup) : invoiceGroup;
    }
}
