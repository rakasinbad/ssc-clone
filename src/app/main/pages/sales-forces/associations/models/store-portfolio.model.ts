import { ITimestamp } from 'app/shared/models/timestamp.model';
import { Store } from './store.model';
import { Portfolio } from './portfolio.model';

export interface IStorePortfolio extends ITimestamp {
    id: string;
    target: number;
    portfolioId: string;
    storeId: string;
    portfolio: Portfolio;
    store: Store;
    creatorId: string;
    // createdAt: string;
    // updatedAt: string;
    // deletedAt: string;
}

export class StorePortfolio implements IStorePortfolio {
    id: string;
    target: number;
    portfolioId: string;
    storeId: string;
    portfolio: Portfolio;
    store: Store;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: IStorePortfolio) {
        const {
            id,
            target,
            portfolioId,
            storeId,
            portfolio,
            store,
            creatorId,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.target = target;
        this.portfolioId = portfolioId;
        this.storeId = storeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.creatorId = creatorId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setPortfolio = portfolio;
        this.setStore = store;
    }

    set setPortfolio(value: Portfolio) {
        this.portfolio = !value ? null : new Portfolio(value);
    }

    set setStore(value: Store) {
        this.store = !value ? null : new Store(value);
    }
}
