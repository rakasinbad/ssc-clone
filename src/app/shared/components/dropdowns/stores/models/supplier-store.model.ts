import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';
import { EStatus, TNullable, TStatus } from 'app/shared/models/global.model';
import { ITimestamp, Timestamp } from 'app/shared/models/timestamp.model';
import { User } from 'app/shared/models/user.model';

export interface ISupplier extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    phoneNo: string;
    status: EStatus;
    urbanId: string;
    storeId: string;
    storeName: string;
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
    storeId: string;
    storeName: string;

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
            deletedAt,
            storeName,
            storeId
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
        this.storeId = storeId;
        this.storeName = storeName;
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
    storeId: string;
    storeName: string;
    status: TStatus;
    store: Merchant;
    owner: any; // TOLONG DI CHECK LAGI @AULIA RAHMAN
}

export class SupplierStore extends Timestamp implements ISupplierStore {
    constructor(
        public id: string,
        public supplierId: string,
        public storeId: string,
        public storeName: string,
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

export interface massUploadModels {
    file: NonNullable<File>;
    type: string;
    // endpoint: NonNullable<string>;
}

export class massUploadModel implements massUploadModels {
    file: NonNullable<File>;
    type: string;
    constructor(data: massUploadModels) {
        const {
            file,
            type
        } = data;

        this.file = file;
        this.type = type;
    }
}
