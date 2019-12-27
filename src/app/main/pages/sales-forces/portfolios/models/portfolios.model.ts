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

        this.user = user ? new User(
            user.id,
            user.fullName,
            user.email,
            user.phoneNo,
            user.mobilePhoneNo,
            user.idNo,
            user.taxNo,
            user.status,
            user.imageUrl,
            user.taxImageUrl,
            user.idImageUrl,
            user.selfieImageUrl,
            user.urbanId,
            user.roles,
            user.createdAt,
            user.updatedAt,
            user.deletedAt,
        ) : user;

        this.invoiceGroup = invoiceGroup ? new InvoiceGroup(invoiceGroup) : invoiceGroup;
    }
}
