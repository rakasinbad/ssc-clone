import { ITimestamp, TNullable, Portfolio, Store } from 'app/shared/models';

type TStatusType = 'active' | 'inactive';

export interface IAssociationStore extends ITimestamp {
    id: string;
    target: number;
    portfolioId: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    portfolio: Portfolio;
    store: Store;
}

export class AssociationStore implements IAssociationStore {
    id: string;
    target: number;
    portfolioId: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    portfolio: Portfolio;
    store: Store;

    constructor(data: IAssociationStore) {
        const {
            id,
            target,
            portfolioId,
            storeId,
            createdAt,
            updatedAt,
            deletedAt,
            portfolio,
            store
        } = data;

        this.id = id;
        this.target = target;
        this.portfolioId = portfolioId;
        this.storeId = storeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.portfolio = portfolio ? new Portfolio(portfolio) : portfolio;
        this.store = store ? new Store(store) : store;
    }
}