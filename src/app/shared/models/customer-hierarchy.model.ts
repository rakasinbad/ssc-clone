import { Store } from 'app/main/pages/accounts/merchants/models';

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
    store?: Store;
}

export class Hierarchy extends Timestamp implements IHierarchy {
    constructor(
        private _id: string,
        private _name: string,
        private _status: TStatus,
        private _supplierId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value ? value.trim() : value;
    }

    get status(): TStatus {
        return this._status;
    }

    set status(value: TStatus) {
        this._status = value;
    }

    get supplierId(): string {
        return this._supplierId;
    }

    set supplierId(value: string) {
        this._supplierId = value;
    }
}

export class CustomerHierarchy extends Timestamp implements ICustomerHierarchy {
    private _store?: Store;

    constructor(
        private _id: string,
        private _storeId: string,
        private _hierarchyId: string,
        private _status: TStatus,
        private _hierarchy: Hierarchy,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get storeId(): string {
        return this._storeId;
    }

    set storeId(value: string) {
        this._storeId = value;
    }

    get hierarchyId(): string {
        return this._hierarchyId;
    }

    set hierarchyId(value: string) {
        this._hierarchyId = value;
    }

    get status(): TStatus {
        return this._status;
    }

    set status(value: TStatus) {
        this._status = value;
    }

    get hierarchy(): Hierarchy {
        return this._hierarchy;
    }

    set hierarchy(value: Hierarchy) {
        this._hierarchy = value;
    }

    get store(): Store {
        return this._store;
    }

    set store(value: Store) {
        this._store = value;
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
