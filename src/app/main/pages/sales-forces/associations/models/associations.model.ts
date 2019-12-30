import { ITimestamp, TNullable, User, InvoiceGroup, Supplier } from 'app/shared/models';

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
    storePortfolios: [];
    totalTargetSales: number;
    actualTargetSales: number;
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
    storePortfolios: [];
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
        this.storePortfolios = storePortfolios;
        this.totalTargetSales = totalTargetSales;
        this.actualTargetSales = actualTargetSales;

        this.invoiceGroup = invoiceGroup ? new InvoiceGroup(invoiceGroup) : invoiceGroup;

        this.user = user ? new User(user) : user;
    }
}
