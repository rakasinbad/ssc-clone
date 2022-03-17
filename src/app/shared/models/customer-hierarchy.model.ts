// import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';

import { TNullable, TStatus } from './global.model';
import { ITimestamp } from './timestamp.model';

interface IHierarchy extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    status: TStatus;
    supplierId: string;
}

export class Hierarchy implements IHierarchy {
    readonly id: NonNullable<string>;
    name: string;
    status: TStatus;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: Hierarchy) {
        const { id, name, status, supplierId, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.name = name ? String(name).trim() : null;
        this.status = status;
        this.supplierId = supplierId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

interface ICustomerHierarchy extends ITimestamp {
    readonly id: NonNullable<string>;
    storeId: string;
    hierarchyId: string;
    status: TStatus;
    hierarchy: Hierarchy;
    store?: any;
}

export class CustomerHierarchy implements ICustomerHierarchy {
    readonly id: NonNullable<string>;
    storeId: string;
    hierarchyId: string;
    status: TStatus;
    hierarchy: Hierarchy;
    store?: any;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: CustomerHierarchy) {
        const {
            id,
            storeId,
            hierarchyId,
            status,
            hierarchy,
            store,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.storeId = storeId;
        this.hierarchyId = hierarchyId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.hierarchy = hierarchy ? new Hierarchy(hierarchy) : null;
        this.setStore = store;
    }

    set setStore(value: any) {
        this.store = value ? value : null;
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
