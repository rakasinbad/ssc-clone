import { ITimestamp, TNullable, User, InvoiceGroup } from 'app/shared/models';

type TPortfolioType = 'multi' | 'single';

interface IPortfolio extends ITimestamp {
    id: string;
    supplierId: string;
    invoiceGroupId: TNullable<string>;
    userId: string;
    name: string;
    code: string;
    type: TPortfolioType;
    user: TNullable<User>;
    invoiceGroup: TNullable<InvoiceGroup>;
}

export class Portfolio implements IPortfolio {
    id: string;
    supplierId: string;
    invoiceGroupId: string;
    userId: string;
    name: string;
    code: string;
    type: TPortfolioType;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    user: TNullable<User>;
    invoiceGroup: TNullable<InvoiceGroup>;

    constructor(data: IPortfolio) {
        const {
            id,
            supplierId,
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
        this.supplierId = supplierId;
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
