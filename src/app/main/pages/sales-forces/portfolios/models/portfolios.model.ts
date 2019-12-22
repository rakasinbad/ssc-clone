import { ITimestamp, TNullable } from 'app/shared/models';

type TPortfolioType = 'multi' | 'single';

interface IPortfolio extends ITimestamp {
    id: string;
    supplierId: string;
    invoiceGroupId: string;
    userId: string;
    name: string;
    code: string;
    type: TPortfolioType;
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
    }
}
