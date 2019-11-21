import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';

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
        public id: string,
        public name: string,
        public longitude: number,
        public latitude: number,
        public phoneNo: string,
        public status: TStatus,
        public urbanId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
        this.phoneNo = phoneNo ? phoneNo.trim() : null;
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
    public user?: User;

    constructor(
        public id: string,
        public userId: string,
        public supplierId: string,
        public status: TStatus,
        public supplier: Supplier,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.supplier = supplier
            ? new Supplier(
                  supplier.id,
                  supplier.name,
                  supplier.longitude,
                  supplier.latitude,
                  supplier.phoneNo,
                  supplier.status,
                  supplier.urbanId,
                  supplier.createdAt,
                  supplier.updatedAt,
                  supplier.deletedAt
              )
            : null;
    }

    set setUser(value: User) {
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
                newUser.setUserStores = value.userStores;
            }

            if (value.userSuppliers) {
                newUser.setUserSuppliers = value.userSuppliers;
            }

            if (value.urban) {
                newUser.setUrban = value.urban;
            }

            if (value.attendances) {
                newUser.setAttendances = value.attendances;
            }

            this.user = newUser;
        } else {
            this.user = null;
        }
    }

    static patch(body: UserSupplierOptions): UserSupplierOptions {
        return body;
    }
}

export type UserSupplierOptions = Partial<UserSupplier>;

interface ISupplierStore {
    id: string;
    supplierId: string;
    storeId: string;
    status: TStatus;
    store: Merchant;
}

export class SupplierStore extends Timestamp implements ISupplierStore {
    constructor(
        public id: string,
        public supplierId: string,
        public storeId: string,
        public status: TStatus,
        public store: Merchant,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        if (store) {
            const newStore = new Merchant(
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
                store.vehicleAccessibilityId,
                store.warehouseId,
                store.userStores,
                store.storeType,
                store.storeGroup,
                store.storeSegment,
                store.urban,
                store.storeConfig,
                store.createdAt,
                store.updatedAt,
                store.deletedAt
            );

            if (store.supplierStores) {
                newStore.setSupplierStores = store.supplierStores;
            }

            if (store.vehicleAccessibility) {
                newStore.setVehicleAccessibility = store.vehicleAccessibility;
            }

            if (store.customerHierarchies) {
                newStore.setCustomerHierarchies = store.customerHierarchies;
            }

            if (store.storeClusters) {
                newStore.setStoreClusters = store.storeClusters;
            }

            if (store.legalInfo) {
                newStore.setLegalInfo = store.legalInfo;
            }

            if (store.owner) {
                newStore.setOwner = store.owner;
            }

            this.store = newStore;
        } else {
            this.store = null;
        }
    }

    static patch(body: SupplierStoreOptions): SupplierStoreOptions {
        return body;
    }
}

export type SupplierStoreOptions = Partial<SupplierStore>;
