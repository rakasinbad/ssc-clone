export interface IStorePortfolio {
    id: string;
    externalId: string;
    storeId: string;
    storeName: string;
    storeType: string;
}

export class StorePortfolio implements IStorePortfolio {
    id: string;
    externalId: string;
    storeId: string;
    storeName: string;
    storeType: string;

    constructor(data: IStorePortfolio) {
        const {
            id,
            externalId,
            storeId,
            storeName,
            storeType = 'unknown'
        } = data;

        this.id = id;
        this.externalId = externalId;
        this.storeId = storeId;
        this.storeName = storeName;
        this.storeType = storeType;
    }
}
