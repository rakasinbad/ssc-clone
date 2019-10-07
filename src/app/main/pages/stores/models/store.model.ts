import { Timestamp, TNullable, TStatus } from 'app/shared/models';

import { StoreConfig } from '../../store-configs/models/store-config.model';

export class Store extends Timestamp {
    id: string;
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    largeArea: string;
    phoneNo: string;
    status: TStatus;
    parent: boolean;
    parentId: string;
    storeTypeId: string;
    storeGroupId: string;
    storeSegmentId: string;
    urbanId: string;
    warehouseId: string;
    storeConfig: StoreConfig;

    constructor(
        id: string,
        name: string,
        longitude: number,
        latitude: number,
        largeArea: string,
        phoneNo: string,
        status: TStatus,
        parent: boolean,
        parentId: string,
        storeTypeId: string,
        storeGroupId: string,
        storeSegmentId: string,
        urbanId: string,
        warehouseId: string,
        storeConfig: StoreConfig,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.name = name;
        this.longitude = longitude;
        this.latitude = latitude;
        this.largeArea = largeArea;
        this.phoneNo = phoneNo;
        this.status = status;
        this.parent = parent || null;
        this.parentId = parentId || null;
        this.storeTypeId = storeTypeId;
        this.storeGroupId = storeGroupId;
        this.storeSegmentId = storeSegmentId;
        this.urbanId = urbanId;
        this.warehouseId = warehouseId;

        if (storeConfig) {
            this.storeConfig = {
                ...new StoreConfig(
                    storeConfig.id,
                    storeConfig.startingWorkHour,
                    storeConfig.finishedWorkHour,
                    storeConfig.status,
                    storeConfig.createdAt,
                    storeConfig.updatedAt,
                    storeConfig.deletedAt
                )
            };
        } else {
            this.storeConfig = null;
        }

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class StoreAssocUser extends Timestamp {
    id: string;
    status: TStatus;
    store: Store;

    constructor(
        id: string,
        status: TStatus,
        store: Store,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.status = status;

        if (store) {
            this.store = {
                ...new Store(
                    store.id,
                    store.name,
                    store.longitude,
                    store.latitude,
                    store.largeArea,
                    store.phoneNo,
                    store.status,
                    store.parent,
                    store.parentId,
                    store.storeTypeId,
                    store.storeGroupId,
                    store.storeSegmentId,
                    store.urbanId,
                    store.warehouseId,
                    store.storeConfig,
                    store.createdAt,
                    store.updatedAt,
                    store.deletedAt
                )
            };
        } else {
            this.store = null;
        }

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
