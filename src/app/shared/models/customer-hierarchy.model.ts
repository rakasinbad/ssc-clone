import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';

import { TNullable, TStatus } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';

interface IHierarchy extends ITimestamp {
    id: string;
    name: string;
    status: TStatus;
    supplierId: string;
}

interface ICustomerHierarchy extends ITimestamp {
    id: string;
    storeId: string;
    hierarchyId: string;
    status: TStatus;
    hierarchy: Hierarchy;
    store?: Merchant;
}

export class Hierarchy extends Timestamp implements IHierarchy {
    constructor(
        public id: string,
        public name: string,
        public status: TStatus,
        public supplierId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
    }
}

export class CustomerHierarchy extends Timestamp implements ICustomerHierarchy {
    public store?: Merchant;

    constructor(
        public id: string,
        public storeId: string,
        public hierarchyId: string,
        public status: TStatus,
        public hierarchy: Hierarchy,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.hierarchy = hierarchy
            ? new Hierarchy(
                  hierarchy.id,
                  hierarchy.name,
                  hierarchy.status,
                  hierarchy.supplierId,
                  hierarchy.createdAt,
                  hierarchy.updatedAt,
                  hierarchy.deletedAt
              )
            : null;
    }

    set setStore(value: Merchant) {
        if (value) {
            const newStore = new Merchant(
                value.id,
                value.storeCode,
                value.name,
                value.address,
                value.taxNo,
                value.longitude,
                value.latitude,
                value.largeArea,
                value.phoneNo,
                value.imageUrl,
                value.taxImageUrl,
                value.status,
                value.reason,
                value.parent,
                value.parentId,
                value.numberOfEmployee,
                value.externalId,
                value.storeTypeId,
                value.storeGroupId,
                value.storeSegmentId,
                value.urbanId,
                value.vehicleAccessibilityId,
                value.warehouseId,
                value.userStores,
                value.storeType,
                value.storeGroup,
                value.storeSegment,
                value.urban,
                value.storeConfig,
                value.createdAt,
                value.updatedAt,
                value.deletedAt
            );

            if (value.supplierStores) {
                newStore.setSupplierStores = value.supplierStores;
            }

            if (value.vehicleAccessibility) {
                newStore.setVehicleAccessibility = value.vehicleAccessibility;
            }

            if (value.customerHierarchies) {
                newStore.setCustomerHierarchies = value.customerHierarchies;
            }

            if (value.storeClusters) {
                newStore.setStoreClusters = value.storeClusters;
            }

            if (value.legalInfo) {
                newStore.setLegalInfo = value.legalInfo;
            }

            if (value.owner) {
                newStore.setOwner = value.owner;
            }

            this.store = newStore;
        } else {
            this.store = null;
        }
    }
}

// export class CustomerHierarchy extends Timestamp {
//     id: string;
//     name: string;
//     status: TStatus;
//     brandId: string;

//     constructor(
//         id: string,
//         name: string,
//         status: TStatus,
//         brandId: string,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name;
//         this.status = status;
//         this.brandId = brandId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// export class CustomerHierarchyAssoc extends Timestamp {
//     id: string;
//     storeId: string;
//     hierarchyId: string;
//     status: TStatus;
//     hierarchy: CustomerHierarchy;

//     constructor(
//         id: string,
//         storeId: string,
//         hierarchyId: string,
//         status: TStatus,
//         hierarchy: CustomerHierarchy,
//         createdAt: TNullable<string>,
//         updatedAt: TNullable<string>,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.storeId = storeId;
//         this.hierarchyId = hierarchyId;
//         this.status = status;
//         this.hierarchy = hierarchy
//             ? {
//                   ...new CustomerHierarchy(
//                       hierarchy.id,
//                       hierarchy.name,
//                       hierarchy.status,
//                       hierarchy.brandId,
//                       hierarchy.createdAt,
//                       hierarchy.updatedAt,
//                       hierarchy.deletedAt
//                   )
//               }
//             : null;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }
