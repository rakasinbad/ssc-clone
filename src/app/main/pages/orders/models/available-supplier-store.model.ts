interface IAvailableSupplierStore {
    supplierStoreId: string;
    storeId: number;
    storeExternalId: string;
    ownerName: string;
    storeName: string;
    storeAddress: string;
    urban: string;
    deliveryAddress: string;
    warehouse: string;
    storeChannelId: string;
    storeClusterId: string;
    storeGroupId: string;
    storeTypeId: string;
}

export class AvailableSupplierStore implements IAvailableSupplierStore {
    supplierStoreId: string;
    storeId: number;
    storeExternalId: string;
    ownerName: string;
    storeName: string;
    storeAddress: string;
    urban: string;
    deliveryAddress: string;
    warehouse: string;
    storeChannelId: string;
    storeClusterId: string;
    storeGroupId: string;
    storeTypeId: string;

    constructor(data: IAvailableSupplierStore) {
        const {
            supplierStoreId,
            storeId,
            storeExternalId,
            ownerName,
            storeName,
            storeAddress,
            urban,
            deliveryAddress,
            warehouse,
            storeChannelId,
            storeClusterId,
            storeGroupId,
            storeTypeId,
        } = data;

        this.supplierStoreId = supplierStoreId;
        this.storeId = storeId;
        this.storeExternalId = storeExternalId;
        this.ownerName = ownerName;
        this.storeName = storeName;
        this.storeAddress = storeAddress;
        this.urban = urban;
        this.deliveryAddress = deliveryAddress;
        this.warehouse = warehouse;
        this.storeChannelId = storeChannelId;
        this.storeClusterId = storeClusterId;
        this.storeGroupId = storeGroupId;
        this.storeTypeId = storeTypeId;
    }
}
