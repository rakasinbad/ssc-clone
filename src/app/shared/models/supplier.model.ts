import { Store as Merchant } from 'app/main/pages/accounts/merchants/models/merchant.model';

import { TNullable, TStatus } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';
import { User } from './user.model';

interface ISupplier extends ITimestamp {
    id: string;
    name: string;
    longitude: number;
    latitude: number;
    phoneNo: string;
    status: TStatus;
    urbanId: string;
}

export class Supplier extends Timestamp implements ISupplier {
    constructor(
        private _id: string,
        private _name: string,
        private _longitude: number,
        private _latitude: number,
        private _phoneNo: string,
        private _status: TStatus,
        private _urbanId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this._name = _name ? _name.trim() : null;
        this._phoneNo = _phoneNo ? _phoneNo.trim() : null;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get longitude(): number {
        return this._longitude;
    }

    get latitude(): number {
        return this._latitude;
    }

    get phoneNo(): string {
        return this._phoneNo;
    }

    get status(): TStatus {
        return this._status;
    }

    get urbanId(): string {
        return this._urbanId;
    }
}

interface IUserSupplier {
    id: string;
    userId: string;
    supplierId: string;
    status: TStatus;
    supplier: Supplier;
    user?: User;
}

export class UserSupplier extends Timestamp implements IUserSupplier {
    private _user?: User;

    constructor(
        private _id: string,
        private _userId: string,
        private _supplierId: string,
        private _status: TStatus,
        private _supplier: Supplier,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this._supplier = _supplier
            ? new Supplier(
                  _supplier.id,
                  _supplier.name,
                  _supplier.longitude,
                  _supplier.latitude,
                  _supplier.phoneNo,
                  _supplier.status,
                  _supplier.urbanId,
                  _supplier.createdAt,
                  _supplier.updatedAt,
                  _supplier.deletedAt
              )
            : null;
    }

    get id(): string {
        return this._id;
    }

    get userId(): string {
        return this._userId;
    }

    get supplierId(): string {
        return this._supplierId;
    }

    get status(): TStatus {
        return this._status;
    }

    get supplier(): Supplier {
        return this._supplier;
    }

    get user(): User {
        return this._user;
    }

    set user(value: User) {
        if (value) {
            const newUser = new User(
                value.id,
                value.fullName,
                value.email,
                value.phoneNo,
                value.mobilePhoneNo,
                value.idNo,
                value.taxNo,
                value.status,
                value.imageUrl,
                value.taxImageUrl,
                value.idImageUrl,
                value.selfieImageUrl,
                value.urbanId,
                value.roles,
                value.createdAt,
                value.urbanId,
                value.deletedAt
            );

            if (value.userStores) {
                newUser.userStores = value.userStores;
            }

            if (value.userSuppliers) {
                newUser.userSuppliers = value.userSuppliers;
            }

            if (value.urban) {
                newUser.urban = value.urban;
            }

            if (value.attendances) {
                newUser.attendances = value.attendances;
            }

            this._user = newUser;
        } else {
            this._user = null;
        }
    }
}

interface ISupplierStore {
    id: string;
    supplierId: string;
    storeId: string;
    status: TStatus;
    store: Merchant;
}

export class SupplierStore extends Timestamp implements ISupplierStore {
    constructor(
        private _id: string,
        private _supplierId: string,
        private _storeId: string,
        private _status: TStatus,
        private _store: Merchant,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        if (_store) {
            const newStore = new Merchant(
                _store.id,
                _store.storeCode,
                _store.name,
                _store.address,
                _store.taxNo,
                _store.longitude,
                _store.latitude,
                _store.largeArea,
                _store.phoneNo,
                _store.imageUrl,
                _store.taxImageUrl,
                _store.status,
                _store.reason,
                _store.parent,
                _store.parentId,
                _store.numberOfEmployee,
                _store.externalId,
                _store.storeTypeId,
                _store.storeGroupId,
                _store.storeSegmentId,
                _store.urbanId,
                _store.vehicleAccessibilityId,
                _store.warehouseId,
                _store.userStores,
                _store.storeType,
                _store.storeGroup,
                _store.storeSegment,
                _store.urban,
                _store.storeConfig,
                _store.createdAt,
                _store.updatedAt,
                _store.deletedAt
            );

            if (_store.supplierStores) {
                newStore.supplierStores = _store.supplierStores;
            }

            if (_store.vehicleAccessibility) {
                newStore.vehicleAccessibility = _store.vehicleAccessibility;
            }

            if (_store.customerHierarchies) {
                newStore.customerHierarchies = _store.customerHierarchies;
            }

            if (_store.storeClusters) {
                newStore.storeClusters = _store.storeClusters;
            }

            if (_store.legalInfo) {
                newStore.legalInfo = _store.legalInfo;
            }

            this._store = newStore;
        } else {
            this._store = null;
        }
    }

    get id(): string {
        return this._id;
    }

    get supplierId(): string {
        return this._supplierId;
    }

    get storeId(): string {
        return this._storeId;
    }

    get status(): TStatus {
        return this._status;
    }

    get store(): Merchant {
        return this._store;
    }

    static patch(body: SupplierStoreOptions): SupplierStoreOptions {
        return body;
    }
}

export type SupplierStoreOptions = Partial<SupplierStore>;
