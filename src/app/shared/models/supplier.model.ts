import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';

import { EStatus, TNullable, TStatus } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';
import { User } from './user.model';

export interface ISupplier extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    phoneNo: string;
    status: EStatus;
    urbanId: string;
}

export class Supplier implements ISupplier {
    readonly id: NonNullable<string>;
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    phoneNo: string;
    status: EStatus;
    urbanId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: ISupplier) {
        const {
            id,
            name,
            address,
            longitude,
            latitude,
            phoneNo,
            status,
            urbanId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.name = name ? String(name).trim() : null;
        this.address = address ? String(address).trim() : null;
        this.longitude = longitude;
        this.latitude = latitude;
        this.phoneNo = phoneNo;
        this.status = status;
        this.urbanId = urbanId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
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

        this.setSupplier = supplier;
    }

    set setSupplier(value: Supplier) {
        this.supplier = value ? new Supplier(value) : null;
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }

    static patch(body: UserSupplierOptions): UserSupplierOptions {
        return body;
    }
}

export type UserSupplierOptions = Partial<UserSupplier>;

interface ISupplierStore {
    id: string;
    supplierId: string;
    name: string;
    storeId: string;
    status: TStatus;
    store: Merchant;
    owner: any; // TOLONG DI CHECK LAGI @AULIA RAHMAN
}

export class SupplierStore extends Timestamp implements ISupplierStore {
    constructor(
        public id: string,
        public supplierId: string,
        public name: string = '-',
        public storeId: string,
        public status: TStatus,
        public store: Merchant,
        public owner: any,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>,
        public outerStore: any = {}
    ) {
        super(createdAt, updatedAt, deletedAt);

        // if (Object.keys(this.outerStore).length > 0) {
        //     delete this.outerStore.store;
        // }

        if (store) {
            this.store = new Merchant(store);

            if (store.owner) {
                this.owner = this.store.owner;
            }
        } else {
            this.store = null;
        }
    }

    static patch(body: SupplierStoreOptions): SupplierStoreOptions {
        return body;
    }
}

export type SupplierStoreOptions = Partial<SupplierStore>;
