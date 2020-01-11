import { ITimestamp, TNullable, User, InvoiceGroup, Supplier } from 'app/shared/models';
import { StorePortfolio } from 'app/main/pages/attendances/models';

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
    associated: [];
    totalTargetSales: number;
    actualTargetSales: number;
}

export interface IAssociationForm {
    userId: number;
    portfolioId: Array<number>;
    delete?: Array<number>;
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
    associated: [];
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
            associated,
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
        this.associated = associated;
        this.storePortfolios = storePortfolios
            ? new StorePortfolio(storePortfolios)
            : storePortfolios;

        this.invoiceGroup = invoiceGroup ? new InvoiceGroup(invoiceGroup) : invoiceGroup;

        this.user = user ? new User(user) : user;
    }
}
