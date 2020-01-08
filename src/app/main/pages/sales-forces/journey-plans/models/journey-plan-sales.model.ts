import { ITimestamp, TNullable } from 'app/shared/models';

import { StorePortfolio } from './journey-plan-store.model';

export interface IJourneyPlanSales extends ITimestamp {
    readonly id: NonNullable<string>;
    journeyPlanId: string;
    store: StorePortfolio;
    storeId: string;
    storeType: string;
}

export class JourneyPlanSales implements IJourneyPlanSales {
    readonly id: NonNullable<string>;
    journeyPlanId: string;
    store: StorePortfolio;
    storeId: string;
    storeType: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IJourneyPlanSales) {
        const {
            id,
            journeyPlanId,
            storeId,
            storeType,
            store,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.journeyPlanId = journeyPlanId;
        this.setStore = store;
        this.storeId = storeId;
        this.storeType = storeType ? String(storeType).trim() : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setStore(value: StorePortfolio) {
        this.store = value ? new StorePortfolio(value) : null;
    }
}
