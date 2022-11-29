interface IOrderStoreAndInformation {
    date: string;
    date_raw: string;
    deliveryAddress: string;
    ownerName: string;
    storeAddress: string;
    storeChannelId: string;
    storeClusterId: string;
    storeExternalId: string;
    storeGroupId: string;
    storeId: number;
    storeName: string;
    storeTypeId: string;
    supplierStoreId: string;
    urban: string;
    warehouse: string;
}

export class OrderStoreAndInformation implements IOrderStoreAndInformation {
    date: string;
    date_raw: string;
    deliveryAddress: string;
    ownerName: string;
    storeAddress: string;
    storeChannelId: string;
    storeClusterId: string;
    storeExternalId: string;
    storeGroupId: string;
    storeId: number;
    storeName: string;
    storeTypeId: string;
    supplierStoreId: string;
    urban: string;
    warehouse: string;

    constructor(data: IOrderStoreAndInformation) {
        const {
            date,
            date_raw,
            deliveryAddress,
            ownerName,
            storeAddress,
            storeChannelId,
            storeClusterId,
            storeExternalId,
            storeGroupId,
            storeId,
            storeName,
            storeTypeId,
            supplierStoreId,
            urban,
            warehouse,
        } = data;

        this.date = date;
        this.date_raw = date_raw;
        this.deliveryAddress = deliveryAddress;
        this.ownerName = ownerName;
        this.storeAddress = storeAddress;
        this.storeChannelId = storeChannelId;
        this.storeClusterId = storeClusterId;
        this.storeExternalId = storeExternalId;
        this.storeGroupId = storeGroupId;
        this.storeId = storeId;
        this.storeName = storeName;
        this.storeTypeId = storeTypeId;
        this.supplierStoreId = supplierStoreId;
        this.urban = urban;
        this.warehouse = warehouse;
    }
}
