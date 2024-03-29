import { CreditLimitStore } from 'app/main/pages/finances/credit-limit-balance/models';
import { HelperService } from 'app/shared/helpers';
import { CustomerHierarchy, Hierarchy } from 'app/shared/models/customer-hierarchy.model';
import { TNullable, TStatus } from 'app/shared/models/global.model';
import { Urban } from 'app/shared/models/location.model';
import { Portfolio } from 'app/shared/models/portfolio.model';
import { StoreCluster } from 'app/shared/models/store-cluster.model';
import { StoreConfig } from 'app/shared/models/store-config.model';
import { StoreGroup } from 'app/shared/models/store-group.model';
import { StoreSegment } from 'app/shared/models/store-segment.model';
import { StoreType } from 'app/shared/models/store-type.model';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { ITimestamp, Timestamp } from 'app/shared/models/timestamp.model';
import { User } from 'app/shared/models/user.model';
import { VehicleAccessibility } from 'app/shared/models/vehicle-accessibility.model';
import { Warehouse } from './warehouse.model';

export interface ICheckOwnerPhoneResponse {
    message: string;
    storeId: TNullable<string>;
    availability: boolean;
    user: TNullable<{
        userId: TNullable<string>;
        userName: TNullable<string>;
        taxNumber: TNullable<string>;
        mobilePhoneNumber: TNullable<string>;
        idNumber: TNullable<string>;
        idNumberPicture: TNullable<string>;
        selfiePicture: TNullable<string>;
    }>;
}

export interface ICalculateSupplierStoreResponse {
    totalStores: string;
    totalVerified: string;
    totalGuest: string;
    totalRejected: string;
    totalPending: string;
    totalUpdating: string;
}

export interface IResendStorePayload {
    supplierId: number;
    stores: Array<{ storeId: number }>;
}

export interface IResendStoreResponse {
    id: NonNullable<string>;
    message: {
        message: string;
        supplierStoreCode: string;
    };
    status: number;
    storeCode: string;
    storeId: string;
}

export interface IStorePortfolio extends ITimestamp {
    readonly id: NonNullable<string>;
    portfolio?: Portfolio;
    portfolioId: string;
    store?: Store;
    storeId: string;
    target: number;
}

export class StorePortfolio implements IStorePortfolio {
    readonly id: NonNullable<string>;
    portfolio?: Portfolio;
    portfolioId: string;
    store?: Store;
    storeId: string;
    target: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStorePortfolio) {
        const {
            id,
            portfolio,
            portfolioId,
            store,
            storeId,
            target,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.portfolioId = portfolioId;
        this.setPortfolio = portfolio;
        this.setStore = store;
        this.storeId = storeId;
        this.target = target;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setPortfolio(value: Portfolio) {
        this.portfolio = value ? new Portfolio(value) : null;
    }

    set setStore(value: Store) {
        this.store = value ? new Store(value) : null;
    }
}

export interface IStore extends ITimestamp {
    readonly id: NonNullable<string>;
    address: string;
    creditLimitStores?: Array<CreditLimitStore>;
    customerHierarchies?: Array<CustomerHierarchy>;
    externalId: string;
    hierarchy: Hierarchy;
    imageUrl: TNullable<string>;
    largeArea: string;
    latitude: number;
    legalInfo?: User;
    longitude: number;
    name: string;
    noteAddress: string;
    numberOfEmployee: TNullable<string>;
    owner?: User;
    parent: boolean;
    parentId: string;
    portfolio?: Partial<Portfolio>;
    phoneNo: string;
    reason: string;
    status: TStatus;
    storeClusters?: Array<StoreCluster>;
    storeCode: string;
    storeConfig: StoreConfig;
    storeGroup: StoreGroup;
    storeGroupId: string;
    storePortfolios?: Array<StorePortfolio>;
    storeSegment: StoreSegment;
    storeSegmentId: string;
    storeType: StoreType;
    storeTypeId: string;
    supplierStores?: Array<SupplierStore>;
    taxImageUrl: TNullable<string>;
    taxNo: string;
    urban: Urban;
    urbanId: string;
    userStores: Array<UserStore>;
    vehicleAccessibility?: VehicleAccessibility;
    vehicleAccessibilityId: string;
    warehouseId: string;
    warehouses?: Warehouse[];
    isSelected?: boolean; // Menandakan apakah object ini terpilih atau tidak.
    source?: 'fetch' | 'list'; // Menandakan apakah object ini berasal hasil fetch atau mengambil dari list (cache).
    isLoading?: boolean; // Untuk keperluan data store diperiksa di back-end.
}

export class Store implements IStore {
    readonly id: NonNullable<string>;
    address: string;
    creditLimitStores?: Array<CreditLimitStore>;
    customerHierarchies?: Array<CustomerHierarchy>;
    externalId: string;
    hierarchy: Hierarchy;
    imageUrl: TNullable<string>;
    largeArea: string;
    latitude: number;
    legalInfo?: User;
    longitude: number;
    name: string;
    noteAddress: string;
    numberOfEmployee: TNullable<string>;
    owner?: User;
    parent: boolean;
    parentId: string;
    phoneNo: string;
    portfolio?: Partial<Portfolio>;
    reason: string;
    status: TStatus;
    storeClusters?: Array<StoreCluster>;
    storeCode: string;
    storeConfig: StoreConfig;
    storeGroup: StoreGroup;
    storeGroupId: string;
    storePortfolios?: Array<StorePortfolio>;
    storeSegment: StoreSegment;
    storeSegmentId: string;
    storeType: StoreType;
    storeTypeId: string;
    supplierStores?: Array<SupplierStore>;
    taxImageUrl: TNullable<string>;
    taxNo: string;
    urban: Urban;
    urbanId: string;
    userStores: Array<UserStore>;
    vehicleAccessibility?: VehicleAccessibility;
    vehicleAccessibilityId: string;
    warehouseId: string;
    warehouses?: Warehouse[];
    sales: Array<User>;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    isSelected?: boolean;
    source?: 'fetch' | 'list';
    isLoading?: boolean;

    constructor(data: Store) {
        const {
            id,
            address,
            creditLimitStores,
            customerHierarchies,
            externalId,
            hierarchy,
            imageUrl,
            largeArea,
            latitude,
            legalInfo,
            longitude,
            name,
            noteAddress,
            numberOfEmployee,
            owner,
            parent,
            parentId,
            phoneNo,
            portfolio,
            reason,
            status,
            storeClusters,
            storeCode,
            storeConfig,
            storeGroup,
            storeGroupId,
            storePortfolios = [],
            storeSegment,
            storeSegmentId,
            storeType,
            storeTypeId,
            supplierStores,
            taxImageUrl,
            taxNo,
            urban,
            urbanId,
            userStores,
            vehicleAccessibility,
            vehicleAccessibilityId,
            warehouseId,
            warehouses = [],
            sales,
            createdAt,
            updatedAt,
            deletedAt,
            isSelected = false,
            source = 'fetch',
            isLoading = false,
        } = data;

        this.id = id;
        this.address = address ? String(address).trim() : null;
        this.externalId = externalId ? String(externalId).trim() : null;
        this.imageUrl = imageUrl ? String(imageUrl).trim() : null;
        this.largeArea = largeArea ? String(largeArea).trim() : null;
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name ? String(name).trim() : null;
        this.noteAddress = noteAddress ? String(noteAddress).trim() : null;
        this.numberOfEmployee = numberOfEmployee ? String(numberOfEmployee).trim() : null;
        this.parent = parent;
        this.parentId = parentId;
        this.phoneNo = phoneNo ? String(phoneNo).trim() : null;
        this.reason = reason ? String(reason).trim() : null;
        this.status = status;
        this.storeCode = storeCode ? String(storeCode).trim() : null;
        this.storeGroupId = storeGroupId;
        this.storeSegmentId = storeSegmentId;
        this.storeTypeId = storeTypeId;
        this.taxImageUrl = taxImageUrl ? String(taxImageUrl).trim() : null;
        this.taxNo = taxNo ? String(taxNo).trim() : null;
        this.urbanId = urbanId;
        this.vehicleAccessibilityId = vehicleAccessibilityId;
        this.warehouseId = warehouseId;
        this.sales = sales;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.isSelected = isSelected;
        this.source = ['fetch', 'list'].includes(source) ? source : 'fetch';
        this.portfolio = portfolio;
        this.isLoading = isLoading;

        this.userStores =
            userStores && userStores.length > 0
                ? userStores.map((row) => {
                      const newUserStore = new UserStore(
                          row.id,
                          row.userId,
                          row.storeId,
                          row.status,
                          row.createdAt,
                          row.updatedAt,
                          row.deletedAt
                      );

                      if (row.user) {
                          newUserStore.setUser = row.user;
                      }

                      if (row.store) {
                          newUserStore.setStore = row.store;
                      }

                      return newUserStore;
                  })
                : [];

        if (supplierStores) {
            this.setSupplierStores = supplierStores;
        }

        if (vehicleAccessibility) {
            this.setVehicleAccessibility = vehicleAccessibility;
        }

        this.storeType = storeType
            ? new StoreType(
                  storeType.id,
                  storeType.name,
                  storeType.createdAt,
                  storeType.updatedAt,
                  storeType.deletedAt
              )
            : null;

        this.storeGroup = storeGroup
            ? new StoreGroup(
                  storeGroup.id,
                  storeGroup.name,
                  storeGroup.createdAt,
                  storeGroup.updatedAt,
                  storeGroup.deletedAt
              )
            : null;

        this.storeSegment = storeSegment
            ? new StoreSegment(
                  storeSegment.id,
                  storeSegment.name,
                  storeSegment.createdAt,
                  storeSegment.updatedAt,
                  storeSegment.deletedAt
              )
            : null;

        this.setHierarchy = hierarchy;
        this.setUrban = urban;

        if (customerHierarchies) {
            this.setCustomerHierarchies = customerHierarchies;
        }

        this.storeConfig = storeConfig
            ? new StoreConfig(
                  storeConfig.id,
                  storeConfig.startingWorkHour,
                  storeConfig.finishedWorkHour,
                  storeConfig.status,
                  storeConfig.storeId,
                  storeConfig.createdAt,
                  storeConfig.updatedAt,
                  storeConfig.deletedAt
              )
            : null;

        if (storeClusters) {
            this.setStoreClusters = storeClusters;
        }

        if (creditLimitStores) {
            this.setCreditLimitStores = creditLimitStores;
        }

        if (legalInfo) {
            this.setLegalInfo = legalInfo;
        }

        if (owner) {
            this.setOwner = owner;
        }

        if (warehouses) {
            this.setWarehouse = warehouses;
        }

        this.storePortfolios =
            storePortfolios.length === 0
                ? []
                : storePortfolios.map((storePortfolio) => new StorePortfolio(storePortfolio));
    }

    set setDeletedAt(time: string) {
        this.deletedAt = time;
    }

    set setSource(source: 'fetch' | 'list') {
        if (['fetch', 'list'].includes(source)) {
            this.source = source;
        } else {
            throw new Error('Merchant source is not valid. Acceptable sources: fetch, list');
        }
    }

    set setSelectedStore(value: boolean) {
        this.isSelected = value;
    }

    set setCreditLimitStores(value: CreditLimitStore[]) {
        if (value && value.length > 0) {
            const newCreditLimitStores = value.map((row) => {
                return new CreditLimitStore(row);
            });

            this.creditLimitStores = newCreditLimitStores;
        } else {
            this.creditLimitStores = [];
        }
    }

    set setHierarchy(value: Hierarchy) {
        this.hierarchy = value ? new Hierarchy(value) : null;
    }

    set setSupplierStores(value: SupplierStore[]) {
        if (value && value.length > 0) {
            const newSupplierStores = value.map((row) => {
                return new SupplierStore(
                    row.id,
                    row.supplierId,
                    row.name,
                    row.storeId,
                    row.status,
                    row.store,
                    row.owner,
                    row.createdAt,
                    row.updatedAt,
                    row.deletedAt
                );
            });

            this.supplierStores = newSupplierStores;
        } else {
            this.supplierStores = [];
        }
    }

    set setVehicleAccessibility(value: VehicleAccessibility) {
        this.vehicleAccessibility = value
            ? new VehicleAccessibility(
                  value.id,
                  value.name,
                  value.createdAt,
                  value.updatedAt,
                  value.deletedAt
              )
            : null;
    }

    set setCustomerHierarchies(value: CustomerHierarchy[]) {
        if (value && value.length > 0) {
            const newCustomerHierarchies = value.map((row) => new CustomerHierarchy(row));

            this.customerHierarchies = newCustomerHierarchies;
        } else {
            this.customerHierarchies = [];
        }
    }

    set setStoreClusters(value: StoreCluster[]) {
        if (value && value.length > 0) {
            const newStoreClusters = value.map((row) => new StoreCluster(row));

            this.storeClusters = newStoreClusters;
        } else {
            this.storeClusters = [];
        }
    }

    set setLegalInfo(value: User) {
        this.legalInfo = value ? new User(value) : null;
    }

    set setOwner(value: User) {
        this.owner = value ? new User(value) : null;
    }

    set setUrban(value: Urban) {
        this.urban = value ? new Urban(value) : null;
    }

    set setWarehouse(value: Warehouse[]) {
        if (value && value.length > 0) {
            this.warehouses = value.map((row) => new Warehouse(row));
        } else {
            this.warehouses = [];
        }
    }

    static patch(body: StoreOptions): StoreOptions {
        return body;
    }

    isPartOfInvoiceGroup(invoiceGroupId: string): boolean {
        if (!invoiceGroupId) {
            return false;
        }

        const storePortfolios = this.storePortfolios;
        const isPart = storePortfolios.filter(
            (storePortfolio) => storePortfolio.portfolio.invoiceGroupId === invoiceGroupId
        );

        return isPart.length > 0;
    }
}

export type StoreOptions = Partial<Store>;

export interface IUserStore {
    id: string;
    userId: string;
    storeId: string;
    status: TStatus;
    user?: User;
    store?: Store;
}

export class UserStore extends Timestamp implements IUserStore {
    public user?: User;
    public store?: Store;

    constructor(
        public id: string,
        public userId: string,
        public storeId: string,
        public status: TStatus,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    set setUser(value: User) {
        this.user = value ? new User(value) : null;
    }

    set setStore(value: Store) {
        if (value) {
            this.store = new Store(value);
        } else {
            this.store = null;
        }
    }

    static patch(body: UserStoreOptions): UserStoreOptions {
        return body;
    }

    public getChainRoles(delimiter: string = ', '): string {
        if (this.user.roles.length === 0) {
            return '';
        } else {
            return this.user.roles.map((role) => role.role).join(delimiter);
        }
    }
}

export type UserStoreOptions = Partial<UserStore>;

interface StoreForm extends Partial<IStore> {
    cluster: { clusterId: string };
}

export type StoreFormOptions = Partial<StoreForm>;

// import { Role } from 'app/main/pages/roles/role.model';
// import { Urban } from 'app/main/pages/urbans/models';
// import {
//     CustomerHierarchyAssoc,
//     IResponsePaginate,
//     ITimestamp,
//     Legal,
//     StoreCluster,
//     StoreGroup,
//     StoreSegment,
//     StoreType,
//     Timestamp,
//     TNullable,
//     TStatus,
//     VehicleAccessibility
// } from 'app/shared/models';
// import * as _ from 'lodash';

// import { AccountAssocStore, TAccountStatus } from '../../models';

// export interface IBrandStore extends ITimestamp {
//     id: string;
//     brandId: string;
//     storeId: string;
//     status: TStatus;
//     store: Store;
// }

// export interface IStore extends ITimestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<number>;
//     vehicleAccessibility: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     warehouseId: string;
//     urban: Urban;
//     customerHierarchies: CustomerHierarchyAssoc[];
//     storeType: StoreType;
//     storeSegment: StoreSegment;
//     storeGroup: StoreGroup;
//     legalInfo: Legal;
// }

// export interface IStoreEdit extends ITimestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     vehicleAccessibilityId: string;
//     warehouseId: string;
//     urban: Urban;
//     storeType: StoreType;
//     storeSegment: StoreSegment;
//     storeGroup: StoreGroup;
//     storeClusters: IStoreClusters[];
// }

// interface IStoreClusters extends ITimestamp {
//     id: string;
//     storeId: string;
//     clusterId: string;
//     cluster: StoreCluster;
// }

// export interface IStoreEmployee extends ITimestamp {
//     id: string;
//     userId: string;
//     storeId: string;
//     status: TStatus;
//     user: AccountAssocStore;
// }

// export interface IStoreEmployeeDetail extends ITimestamp {
//     id: string;
//     fullName: string;
//     email: string;
//     phoneNo: TNullable<string>;
//     mobilePhoneNo: string;
//     idNo: string;
//     taxNo: string;
//     status: TAccountStatus;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     idImageUrl: TNullable<string>;
//     selfieImageUrl: TNullable<string>;
//     roles: Role[];
// }

// export interface IBrandStoreResponse extends IResponsePaginate {
//     data: IBrandStore[];
// }

// export interface IStoreEmployeeResponse extends IResponsePaginate {
//     data: IStoreEmployee[];
// }

// export interface IBrandStoreDeleteResponse extends ITimestamp {
//     id: string;
//     brandId: string;
//     storeId: string;
//     status: TStatus;
// }

// export interface IStoreCreateResponse extends ITimestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     vehicleAccessibilityId: string;
//     warehouseId: string;
// }

// export interface IStoreEditResponse extends ITimestamp {
//     id: string;
//     brandId: string;
//     storeId: string;
//     status: TStatus;
// }

// export class BrandStore extends Timestamp {
//     id: string;
//     brandId: string;
//     storeId: string;
//     status: TStatus;
//     store: Store;

//     constructor(
//         id: string,
//         brandId: string,
//         storeId: string,
//         status: TStatus,
//         store: Store,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.brandId = brandId;
//         this.storeId = storeId;
//         this.status = status;
//         this.store = store
//             ? {
//                   ...new Store(
//                       store.id,
//                       store.storeCode,
//                       store.name,
//                       store.address,
//                       store.taxNo,
//                       store.longitude,
//                       store.latitude,
//                       store.largeArea,
//                       store.phoneNo,
//                       store.imageUrl,
//                       store.taxImageUrl,
//                       store.status,
//                       store.reason,
//                       store.parent,
//                       store.parentId,
//                       store.numberOfEmployee,
//                       store.externalId,
//                       store.storeTypeId,
//                       store.storeGroupId,
//                       store.storeSegmentId,
//                       store.urbanId,
//                       store.warehouseId,
//                       store.vehicleAccessibility,
//                       store.urban,
//                       store.customerHierarchies,
//                       store.storeType,
//                       store.storeSegment,
//                       store.storeGroup,
//                       store.legalInfo,
//                       store.createdAt,
//                       store.updatedAt,
//                       store.deletedAt
//                   )
//               }
//             : null;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// export class Store extends Timestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<number>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     warehouseId: string;
//     vehicleAccessibility: VehicleAccessibility;
//     urban: Urban;
//     customerHierarchies: CustomerHierarchyAssoc[];
//     storeType: StoreType;
//     storeSegment: StoreSegment;
//     storeGroup: StoreGroup;
//     legalInfo: Legal;

//     constructor(
//         id: string,
//         storeCode: string,
//         name: string,
//         address: string,
//         taxNo: TNullable<string>,
//         longitude: TNullable<number>,
//         latitude: TNullable<number>,
//         largeArea: TNullable<number>,
//         phoneNo: TNullable<string>,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         status: TStatus,
//         reason: string,
//         parent: boolean,
//         parentId: string,
//         numberOfEmployee: TNullable<number>,
//         externalId: string,
//         storeTypeId: string,
//         storeGroupId: string,
//         storeSegmentId: string,
//         urbanId: string,
//         warehouseId: string,
//         vehicleAccessibility: VehicleAccessibility,
//         urban: Urban,
//         customerHierarchies: CustomerHierarchyAssoc[],
//         storeType: StoreType,
//         storeSegment: StoreSegment,
//         storeGroup: StoreGroup,
//         legalInfo: Legal,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.storeCode = storeCode ? storeCode.trim() : storeCode;
//         this.name = name ? name.trim() : name;
//         this.address = address ? address.trim() : address;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.longitude = longitude;
//         this.latitude = latitude;
//         this.largeArea = largeArea;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
//         this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : taxImageUrl;
//         this.status = status;
//         this.reason = reason;
//         this.parent = parent;
//         this.parentId = parentId;
//         this.numberOfEmployee = numberOfEmployee;
//         this.externalId = externalId;
//         this.storeTypeId = storeTypeId;
//         this.storeGroupId = storeGroupId;
//         this.storeSegmentId = storeSegmentId;
//         this.urbanId = urbanId;
//         this.warehouseId = warehouseId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         this.vehicleAccessibility = vehicleAccessibility
//             ? {
//                   ...new VehicleAccessibility(
//                       vehicleAccessibility.name,
//                       vehicleAccessibility.createdAt,
//                       vehicleAccessibility.updatedAt,
//                       vehicleAccessibility.deletedAt,
//                       vehicleAccessibility.id
//                   )
//               }
//             : null;

//         this.urban = urban
//             ? {
//                   ...new Urban(
//                       urban.id,
//                       urban.zipCode,
//                       urban.city,
//                       urban.district,
//                       urban.urban,
//                       urban.provinceId,
//                       urban.province,
//                       urban.createdAt,
//                       urban.updatedAt,
//                       urban.deletedAt
//                   )
//               }
//             : null;

//         this.storeType = storeType
//             ? {
//                   ...new StoreType(
//                       storeType.name,
//                       storeType.createdAt,
//                       storeType.updatedAt,
//                       storeType.deletedAt,
//                       storeType.id
//                   )
//               }
//             : null;

//         this.storeSegment = storeSegment
//             ? {
//                   ...new StoreSegment(
//                       storeSegment.name,
//                       storeSegment.createdAt,
//                       storeSegment.updatedAt,
//                       storeSegment.deletedAt,
//                       storeSegment.id
//                   )
//               }
//             : null;

//         this.storeGroup = storeGroup
//             ? {
//                   ...new StoreGroup(
//                       storeGroup.name,
//                       storeGroup.createdAt,
//                       storeGroup.updatedAt,
//                       storeGroup.deletedAt,
//                       storeGroup.id
//                   )
//               }
//             : null;

//         this.legalInfo = legalInfo
//             ? {
//                   ...new Legal(
//                       legalInfo.id,
//                       legalInfo.fullName,
//                       legalInfo.email,
//                       legalInfo.phoneNo,
//                       legalInfo.mobilePhoneNo,
//                       legalInfo.idNo,
//                       legalInfo.taxNo,
//                       legalInfo.status,
//                       legalInfo.imageUrl,
//                       legalInfo.taxImageUrl,
//                       legalInfo.idImageUrl,
//                       legalInfo.selfieImageUrl,
//                       legalInfo.urbanId,
//                       legalInfo.createdAt,
//                       legalInfo.updatedAt,
//                       legalInfo.deletedAt
//                   )
//               }
//             : null;

//         if (customerHierarchies && customerHierarchies.length > 0) {
//             customerHierarchies = [
//                 ...customerHierarchies.map(customerHierarchy => {
//                     return {
//                         ...new CustomerHierarchyAssoc(
//                             customerHierarchy.id,
//                             customerHierarchy.storeId,
//                             customerHierarchy.hierarchyId,
//                             customerHierarchy.status,
//                             customerHierarchy.hierarchy,
//                             customerHierarchy.createdAt,
//                             customerHierarchy.updatedAt,
//                             customerHierarchy.deletedAt
//                         )
//                     };
//                 })
//             ];
//             this.customerHierarchies = customerHierarchies;
//         } else {
//             this.customerHierarchies = [];
//         }
//     }
// }

// export class StoreEdit extends Timestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     vehicleAccessibilityId: string;
//     warehouseId: string;
//     urban: Urban;
//     storeType: StoreType;
//     storeSegment: StoreSegment;
//     storeGroup: StoreGroup;
//     storeClusters: StoreCluster[];

//     constructor(
//         id: string,
//         storeCode: string,
//         name: string,
//         address: string,
//         taxNo: TNullable<string>,
//         longitude: TNullable<number>,
//         latitude: TNullable<number>,
//         largeArea: TNullable<number>,
//         phoneNo: TNullable<string>,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         status: TStatus,
//         reason: string,
//         parent: boolean,
//         parentId: string,
//         numberOfEmployee: TNullable<string>,
//         externalId: string,
//         storeTypeId: string,
//         storeGroupId: string,
//         storeSegmentId: string,
//         urbanId: string,
//         vehicleAccessibilityId: string,
//         warehouseId: string,
//         urban: Urban,
//         storeType: StoreType,
//         storeSegment: StoreSegment,
//         storeGroup: StoreGroup,
//         storeClusters: StoreCluster[],
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.storeCode = storeCode ? storeCode.trim() : storeCode;
//         this.name = name ? name.trim() : name;
//         this.address = address ? address.trim() : address;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.longitude = longitude;
//         this.latitude = latitude;
//         this.largeArea = largeArea;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
//         this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : taxImageUrl;
//         this.status = status;
//         this.reason = reason;
//         this.parent = parent;
//         this.parentId = parentId;
//         this.numberOfEmployee = numberOfEmployee;
//         this.externalId = externalId;
//         this.storeTypeId = storeTypeId;
//         this.storeGroupId = storeGroupId;
//         this.storeSegmentId = storeSegmentId;
//         this.urbanId = urbanId;
//         this.vehicleAccessibilityId = vehicleAccessibilityId;
//         this.warehouseId = warehouseId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         this.urban = urban
//             ? {
//                   ...new Urban(
//                       urban.id,
//                       urban.zipCode,
//                       urban.city,
//                       urban.district,
//                       urban.urban,
//                       urban.provinceId,
//                       urban.province,
//                       urban.createdAt,
//                       urban.updatedAt,
//                       urban.deletedAt
//                   )
//               }
//             : null;

//         this.storeType = storeType
//             ? {
//                   ...new StoreType(
//                       storeType.name,
//                       storeType.createdAt,
//                       storeType.updatedAt,
//                       storeType.deletedAt,
//                       storeType.id
//                   )
//               }
//             : null;

//         this.storeSegment = storeSegment
//             ? {
//                   ...new StoreSegment(
//                       storeSegment.name,
//                       storeSegment.createdAt,
//                       storeSegment.updatedAt,
//                       storeSegment.deletedAt,
//                       storeSegment.id
//                   )
//               }
//             : null;

//         this.storeGroup = storeGroup
//             ? {
//                   ...new StoreGroup(
//                       storeGroup.name,
//                       storeGroup.createdAt,
//                       storeGroup.updatedAt,
//                       storeGroup.deletedAt,
//                       storeGroup.id
//                   )
//               }
//             : null;

//         this.storeClusters =
//             storeClusters && storeClusters.length > 0
//                 ? [
//                       ...storeClusters.map(row => {
//                           return {
//                               ...new StoreCluster(
//                                   row.name,
//                                   row.createdAt,
//                                   row.updatedAt,
//                                   row.deletedAt,
//                                   row.id
//                               )
//                           };
//                       })
//                   ]
//                 : storeClusters;
//     }
// }

// export class StoreEmployee extends Timestamp {
//     id: string;
//     userId: string;
//     storeId: string;
//     status: TStatus;
//     user: AccountAssocStore;

//     constructor(
//         id: string,
//         userId: string,
//         storeId: string,
//         status: TStatus,
//         user: AccountAssocStore,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.userId = userId;
//         this.storeId = storeId;
//         this.status = status;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         this.user = user
//             ? {
//                   ...new AccountAssocStore(
//                       user.id,
//                       user.fullName,
//                       user.email,
//                       user.phoneNo,
//                       user.mobilePhoneNo,
//                       user.idNo,
//                       user.taxNo,
//                       user.status,
//                       user.imageUrl,
//                       user.taxImageUrl,
//                       user.idImageUrl,
//                       user.selfieImageUrl,
//                       user.urbanId,
//                       user.roles,
//                       user.attendances,
//                       user.createdAt,
//                       user.updatedAt,
//                       user.deletedAt
//                   )
//               }
//             : null;
//     }
// }

// export class StoreEmployeeDetail extends Timestamp {
//     id: string;
//     fullName: string;
//     email: string;
//     phoneNo: TNullable<string>;
//     mobilePhoneNo: string;
//     idNo: string;
//     taxNo: string;
//     status: TAccountStatus;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     idImageUrl: TNullable<string>;
//     selfieImageUrl: TNullable<string>;
//     roles: Role[];

//     constructor(
//         id: string,
//         fullName: string,
//         email: string,
//         phoneNo: TNullable<string>,
//         mobilePhoneNo: string,
//         idNo: string,
//         taxNo: string,
//         status: TAccountStatus,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         idImageUrl: TNullable<string>,
//         selfieImageUrl: TNullable<string>,
//         roles: Role[],
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.fullName = fullName ? fullName.trim() : fullName;
//         this.email = email ? email.trim() : email;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.mobilePhoneNo = mobilePhoneNo ? mobilePhoneNo.trim() : mobilePhoneNo;
//         this.idNo = idNo;
//         this.taxNo = taxNo;
//         this.status = status;
//         this.imageUrl = imageUrl;
//         this.taxImageUrl = taxImageUrl;
//         this.idImageUrl = idImageUrl;
//         this.selfieImageUrl = selfieImageUrl;

//         if (roles && roles.length > 0) {
//             roles = [
//                 ...roles.map(role => {
//                     return {
//                         ...new Role(
//                             role.id,
//                             role.role,
//                             role.description,
//                             role.status,
//                             role.roleTypeId,
//                             role.privileges,
//                             role.createdAt,
//                             role.updatedAt,
//                             role.deletedAt
//                         )
//                     };
//                 })
//             ];
//             this.roles = _.sortBy(roles, ['role'], ['asc']);
//         } else {
//             this.roles = [];
//         }
//     }
// }

// export class FormStore {
//     storeCode: string;
//     name: string;
//     image: string;
//     taxNo: string;
//     address: string;
//     longitude?: TNullable<number>;
//     latitude?: TNullable<number>;
//     phoneNo: string;
//     status: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     largeArea?: string;
//     numberOfEmployee?: string;
//     vehicleAccessibilityId?: string;
//     urbanId: string;
//     user: FormUser;
//     cluster: FormCluster;
//     brand: FormBrand;

//     constructor(
//         storeCode: string,
//         name: string,
//         image: string,
//         taxNo: string,
//         address: string,
//         phoneNo: string,
//         status: string,
//         storeTypeId: string,
//         storeGroupId: string,
//         storeSegmentId: string,
//         urbanId: string,
//         user: FormUser,
//         cluster: FormCluster,
//         brand: FormBrand,
//         largeAre?: string,
//         numberOfEmployee?: string,
//         vehicleAccessibilityId?: string
//     ) {
//         this.storeCode = storeCode ? storeCode.trim() : storeCode;
//         this.name = name ? name.trim() : name;
//         this.image = image;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.address = address ? address.trim() : address;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.status = status ? status.trim() : 'active';
//         this.storeTypeId = storeTypeId;
//         this.storeGroupId = storeGroupId;
//         this.storeSegmentId = storeSegmentId;
//         this.urbanId = urbanId;
//         this.user = user
//             ? {
//                   ...new FormUser(
//                       user.fullName,
//                       user.taxNo,
//                       user.idImage,
//                       user.selfieImage,
//                       user.phone,
//                       user.status,
//                       user.roles,
//                       user.email,
//                       user.password
//                   )
//               }
//             : null;

//         this.cluster = cluster ? { ...new FormCluster(cluster.clusterId) } : null;
//         this.brand = brand ? { ...new FormBrand(brand.brandId) } : null;

//         if (largeAre) {
//             this.largeArea = largeAre;
//         }

//         if (numberOfEmployee) {
//             this.numberOfEmployee = numberOfEmployee;
//         }

//         if (vehicleAccessibilityId) {
//             this.vehicleAccessibilityId = vehicleAccessibilityId;
//         }
//     }
// }

// export class FormStoreEdit {
//     storeCode?: string;
//     name?: string;
//     image?: string;
//     taxNo?: string;
//     address?: string;
//     longitude?: TNullable<number>;
//     latitude?: TNullable<number>;
//     phoneNo?: string;
//     storeTypeId?: string;
//     storeGroupId?: string;
//     storeSegmentId?: string;
//     largeArea?: string;
//     numberOfEmployee?: string;
//     vehicleAccessibilityId?: string;
//     urbanId?: string;
//     cluster?: FormCluster;

//     constructor(
//         storeCode?: string,
//         name?: string,
//         image?: string,
//         taxNo?: string,
//         address?: string,
//         phoneNo?: string,
//         storeTypeId?: string,
//         storeGroupId?: string,
//         storeSegmentId?: string,
//         urbanId?: string,
//         cluster?: FormCluster,
//         largeAre?: string,
//         numberOfEmployee?: string,
//         vehicleAccessibilityId?: string
//     ) {
//         if (storeCode) {
//             this.storeCode = storeCode.trim();
//         }

//         if (name) {
//             this.name = name.trim();
//         }

//         if (image) {
//             this.image = image;
//         }

//         if (taxNo) {
//             this.taxNo = taxNo.trim();
//         }

//         if (address) {
//             this.address = address.trim();
//         }

//         if (address) {
//             this.address = address.trim();
//         }

//         if (phoneNo) {
//             this.phoneNo = phoneNo.trim();
//         }

//         if (storeTypeId) {
//             this.storeTypeId = storeTypeId;
//         }

//         if (storeGroupId) {
//             this.storeGroupId = storeGroupId;
//         }

//         if (storeSegmentId) {
//             this.storeSegmentId = storeSegmentId;
//         }

//         if (urbanId) {
//             this.urbanId = urbanId;
//         }

//         if (cluster) {
//             this.cluster = { ...new FormCluster(cluster.clusterId) };
//         }

//         if (largeAre) {
//             this.largeArea = largeAre;
//         }

//         if (numberOfEmployee) {
//             this.numberOfEmployee = numberOfEmployee;
//         }

//         if (vehicleAccessibilityId) {
//             this.vehicleAccessibilityId = vehicleAccessibilityId;
//         }
//     }
// }

// export class FormUser {
//     fullName: string;
//     taxNo: string;
//     idImage: string;
//     selfieImage: string;
//     phone: string;
//     email?: string;
//     password?: string;
//     status: string;
//     roles: string[];

//     constructor(
//         fullName: string,
//         taxNo: string,
//         idImage: string,
//         selfieImage: string,
//         phone: string,
//         status: string,
//         roles: string[],
//         email?: string,
//         password?: string
//     ) {
//         this.fullName = fullName ? fullName.trim() : fullName;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.idImage = idImage;
//         this.selfieImage = selfieImage;
//         this.phone = phone ? phone.trim() : phone;
//         this.status = status ? status.trim() : 'active';
//         this.roles = roles ? roles : ['1'];

//         if (email) {
//             this.email = email.trim();
//         }

//         if (password) {
//             this.password = password.trim();
//         }
//     }
// }

// export class FormCluster {
//     clusterId: string;

//     constructor(clusterId: string) {
//         this.clusterId = clusterId;
//     }
// }

// export class FormBrand {
//     brandId: string;

//     constructor(brandId: string) {
//         this.brandId = brandId;
//     }
// }

// export class UserStore extends Timestamp {
//     constructor(
//         private _id: string,
//         private _userId: string,
//         private _storeId: string,
//         private _status: TStatus,
//         private _store: Store,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);
//     }

//     get id(): string {
//         return this._id;
//     }

//     set id(value: string) {
//         this._id = value;
//     }

//     get userId(): string {
//         return this._userId;
//     }

//     set userId(value: string) {
//         this._userId = value;
//     }

//     get storeId(): string {
//         return this._storeId;
//     }

//     set storeId(value: string) {
//         this._storeId = value;
//     }

//     get status(): TStatus {
//         return this._status;
//     }

//     set status(value: TStatus) {
//         this._status = value;
//     }

//     get store(): Store {
//         return this._store;
//     }

//     set store(value: Store) {
//         this._store = value;
//     }
// }

// class UserStores extends Timestamp {
//     id: string;
//     userId: string;
//     storeId: string;
//     status: TAccountStatus;
//     store: StoreAssocUserStores;

//     constructor(
//         id: string,
//         userId: string,
//         storeId: string,
//         status: TAccountStatus,
//         store: StoreAssocUserStores,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.userId = userId;
//         this.storeId = storeId;
//         this.status = status;
//         this.store = store
//             ? {
//                   ...new StoreAssocUserStores(
//                       store.id,
//                       store.storeCode,
//                       store.name,
//                       store.address,
//                       store.taxNo,
//                       store.longitude,
//                       store.latitude,
//                       store.largeArea,
//                       store.phoneNo,
//                       store.imageUrl,
//                       store.taxImageUrl,
//                       store.status,
//                       store.reason,
//                       store.parent,
//                       store.parentId,
//                       store.numberOfEmployee,
//                       store.vehicleAccessibility,
//                       store.externalId,
//                       store.storeTypeId,
//                       store.storeGroupId,
//                       store.storeSegmentId,
//                       store.urbanId,
//                       store.warehouseId,
//                       store.owner,
//                       store.createdAt,
//                       store.updatedAt,
//                       store.deletedAt
//                   )
//               }
//             : null;
//     }
// }

// class StoreAssocUserStores extends Timestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<number>;
//     vehicleAccessibility: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     warehouseId: string;
//     owner: Owner[];

//     constructor(
//         id: string,
//         storeCode: string,
//         name: string,
//         address: string,
//         taxNo: TNullable<string>,
//         longitude: TNullable<number>,
//         latitude: TNullable<number>,
//         largeArea: TNullable<number>,
//         phoneNo: TNullable<string>,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         status: TStatus,
//         reason: string,
//         parent: boolean,
//         parentId: string,
//         numberOfEmployee: TNullable<number>,
//         vehicleAccessibility: TNullable<string>,
//         externalId: string,
//         storeTypeId: string,
//         storeGroupId: string,
//         storeSegmentId: string,
//         urbanId: string,
//         warehouseId: string,
//         owner: Owner[],
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.storeCode = storeCode ? storeCode.trim() : storeCode;
//         this.name = name ? name.trim() : name;
//         this.address = address ? address.trim() : address;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.longitude = longitude;
//         this.latitude = latitude;
//         this.largeArea = largeArea;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
//         this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : taxImageUrl;
//         this.status = status;
//         this.reason = reason ? reason.trim() : reason;
//         this.parent = parent;
//         this.parentId = parentId;
//         this.numberOfEmployee = numberOfEmployee;
//         this.vehicleAccessibility = vehicleAccessibility;
//         this.externalId = externalId;
//         this.storeTypeId = storeTypeId;
//         this.storeGroupId = storeGroupId;
//         this.storeSegmentId = storeSegmentId;
//         this.urbanId = urbanId;
//         this.warehouseId = warehouseId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         if (owner && owner.length > 0) {
//             owner = [
//                 ...owner.map(row => {
//                     return {
//                         ...new Owner(
//                             row.id,
//                             row.fullName,
//                             row.email,
//                             row.phoneNo,
//                             row.mobilePhoneNo,
//                             row.idNo,
//                             row.taxNo,
//                             row.status,
//                             row.imageUrl,
//                             row.taxImageUrl,
//                             row.idImageUrl,
//                             row.selfieImageUrl,
//                             row.urbanId,
//                             row.roles,
//                             row.createdAt,
//                             row.updatedAt,
//                             row.deletedAt
//                         )
//                     };
//                 })
//             ];
//             this.owner = owner;
//         } else {
//             this.owner = [];
//         }
//     }
// }

// class Owner extends Timestamp {
//     id: string;
//     fullName: string;
//     email: string;
//     phoneNo: TNullable<string>;
//     mobilePhoneNo: string;
//     idNo: string;
//     taxNo: string;
//     status: TAccountStatus;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     idImageUrl: TNullable<string>;
//     selfieImageUrl: TNullable<string>;
//     urbanId: string;
//     roles: OwnerRole[];

//     constructor(
//         id: string,
//         fullName: string,
//         email: string,
//         phoneNo: TNullable<string>,
//         mobilePhoneNo: string,
//         idNo: string,
//         taxNo: string,
//         status: TAccountStatus,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         idImageUrl: TNullable<string>,
//         selfieImageUrl: TNullable<string>,
//         urbanId: string,
//         roles: OwnerRole[],
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.fullName = fullName ? fullName.trim() : fullName;
//         this.email = email ? email.trim() : email;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.mobilePhoneNo = mobilePhoneNo ? mobilePhoneNo.trim() : mobilePhoneNo;
//         this.idNo = idNo;
//         this.taxNo = taxNo;
//         this.status = status;
//         this.imageUrl = imageUrl;
//         this.taxImageUrl = taxImageUrl;
//         this.idImageUrl = idImageUrl;
//         this.selfieImageUrl = selfieImageUrl;
//         this.urbanId = urbanId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         if (roles && roles.length > 0) {
//             roles = [
//                 ...roles.map(role => {
//                     return {
//                         ...new OwnerRole(
//                             role.id,
//                             role.role,
//                             role.description,
//                             role.status,
//                             role.roleTypeId,
//                             role.createdAt,
//                             role.updatedAt,
//                             role.deletedAt
//                         )
//                     };
//                 })
//             ];
//             this.roles = roles;
//         } else {
//             this.roles = [];
//         }
//     }
// }

// class OwnerRole extends Timestamp {
//     id: string;
//     role: string;
//     description: string;
//     status: TStatus;
//     roleTypeId: string;

//     constructor(
//         id: string,
//         role: string,
//         description: string,
//         status: TStatus,
//         roleTypeId: string,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.role = role ? role.trim() : role;
//         this.description = description ? description.trim() : description;
//         this.status = status;
//         this.roleTypeId = roleTypeId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// /* export class StoreGroup extends Timestamp {
//     id: string;
//     name: string;

//     constructor(
//         id: string,
//         name: string,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name ? name.trim() : name;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// export class StoreSegment extends Timestamp {
//     id: string;
//     name: string;

//     constructor(
//         id: string,
//         name: string,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name ? name.trim() : name;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// export class StoreType extends Timestamp {
//     id: string;
//     name: string;

//     constructor(
//         id: string,
//         name: string,
//         createdAt: string>,
//         updatedAt: string>,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name ? name.trim() : name;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// } */

// // -----------------------------------------------------------------------------------------------------
// // For Demo
// // -----------------------------------------------------------------------------------------------------

// export interface IMerchantDemo {
//     id: string;
//     storeName: string;
//     address: string;
//     ownerPhoneNumber: string;
//     storeSegment: string;
//     storeType: string;
//     customerHierarchy: string;
//     status: string;
// }

// export interface IStoreEmployeeDemo {
//     id: string;
//     name: string;
//     role: string;
//     phoneNumber: string;
//     lastCheckIn: string;
// }
