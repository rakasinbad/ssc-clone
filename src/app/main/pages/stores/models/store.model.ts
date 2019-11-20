import { Timestamp, TNullable, TStatus } from 'app/shared/models';

import { Store } from '../../accounts/merchants/models';
import { StoreConfig } from '../../store-configs/models/store-config.model';

// export class Store extends Timestamp {
//     id: string;
//     name: string;
//     address: string;
//     longitude: number;
//     latitude: number;
//     largeArea: string;
//     phoneNo: string;
//     status: TStatus;
//     parent: boolean;
//     parentId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     warehouseId: string;
//     storeConfig: StoreConfig;
//     vehicleAccessibilityId: string;
//     taxImageUrl: string;
//     taxNo: string;
//     storeCode: string;

//     constructor(
//         id: string,
//         name: string,
//         longitude: number,
//         latitude: number,
//         largeArea: string,
//         phoneNo: string,
//         status: TStatus,
//         parent: boolean,
//         parentId: string,
//         storeTypeId: string,
//         storeGroupId: string,
//         storeSegmentId: string,
//         urbanId: string,
//         warehouseId: string,
//         storeConfig: StoreConfig,
//         vehicleAccessibilityId: string,
//         taxImageUrl: string,
//         taxNo: string,
//         storeCode: string,
//         createdAt: TNullable<string>,
//         updatedAt: TNullable<string>,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name;
//         this.longitude = longitude;
//         this.latitude = latitude;
//         this.largeArea = largeArea;
//         this.phoneNo = phoneNo;
//         this.status = status;
//         this.parent = parent || null;
//         this.parentId = parentId || null;
//         this.storeTypeId = storeTypeId;
//         this.storeGroupId = storeGroupId;
//         this.storeSegmentId = storeSegmentId;
//         this.urbanId = urbanId;
//         this.warehouseId = warehouseId;
//         this.vehicleAccessibilityId = vehicleAccessibilityId;
//         this.taxImageUrl = taxImageUrl;
//         this.taxNo = taxNo;
//         this.storeCode = storeCode;

//         if (storeConfig) {
//             this.storeConfig = {
//                 ...new StoreConfig(
//                     storeConfig.id,
//                     storeConfig.startingWorkHour,
//                     storeConfig.finishedWorkHour,
//                     storeConfig.status,
//                     storeConfig.createdAt,
//                     storeConfig.updatedAt,
//                     storeConfig.deletedAt
//                 )
//             };
//         } else {
//             this.storeConfig = null;
//         }

//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

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
                    store.storeCode,
                    store.name,
                    store.address,
                    store.taxNo,
                    store.longitude,
                    store.latitude,
                    store.largeArea,
                    store.phoneNo,
                    store.imageUrl,
                    store.taxImageUrl,
                    store.status,
                    store.reason,
                    store.parent,
                    store.parentId,
                    store.numberOfEmployee,
                    store.externalId,
                    store.storeTypeId,
                    store.storeGroupId,
                    store.storeSegmentId,
                    store.urbanId,
                    store.warehouseId,
                    store.vehicleAccessibility,
                    store.urban,
                    store.customerHierarchies,
                    store.storeType,
                    store.storeSegment,
                    store.storeGroup,
                    store.legalInfo,
                    store.userStores,
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
