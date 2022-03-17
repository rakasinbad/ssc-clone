// import { CreditLimitStore } from 'app/main/pages/finances/credit-limit-balance/models';
import { ITimestamp, Timestamp } from 'app/shared/models/timestamp.model';

import { CustomerHierarchy, Hierarchy } from './customer-hierarchy.model';
import { TNullable, TStatus } from './global.model';
import { Urban } from './location.model';
import { Portfolio } from './portfolio.model';
import { StoreCluster } from './store-cluster.model';
import { StoreConfig } from './store-config.model';
import { StoreGroup } from './store-group.model';
import { StoreSegment } from './store-segment.model';
import { StoreType } from './store-type.model';
import { SupplierStore } from './supplier.model';
import { User } from './user.model';
import { VehicleAccessibility } from './vehicle-accessibility.model';

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
            deletedAt
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
    creditLimitStores?: Array<any>;
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
    isSelected?: boolean; // Menandakan apakah object ini terpilih atau tidak.
    source?: 'fetch' | 'list'; // Menandakan apakah object ini berasal hasil fetch atau mengambil dari list (cache).
}

export class Store implements IStore {
    readonly id: NonNullable<string>;
    address: string;
    creditLimitStores?: Array<any>;
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
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    isSelected?: boolean;
    source?: 'fetch' | 'list';

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
            createdAt,
            updatedAt,
            deletedAt,
            isSelected = false,
            source = 'fetch'
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
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.isSelected = isSelected;
        this.source = ['fetch', 'list'].includes(source) ? source : 'fetch';

        this.userStores =
            userStores && userStores.length > 0
                ? userStores.map(row => {
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

        this.storePortfolios =
            storePortfolios.length === 0
                ? []
                : storePortfolios.map(storePortfolio => new StorePortfolio(storePortfolio));
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

    set setCreditLimitStores(value: any) {
        if (value && value.length > 0) {
            const newCreditLimitStores = value.map(row => {
                return row;
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
            const newSupplierStores = value.map(row => {
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
            const newCustomerHierarchies = value.map(row => new CustomerHierarchy(row));

            this.customerHierarchies = newCustomerHierarchies;
        } else {
            this.customerHierarchies = [];
        }
    }

    set setStoreClusters(value: StoreCluster[]) {
        if (value && value.length > 0) {
            const newStoreClusters = value.map(row => new StoreCluster(row));

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

    static patch(body: StoreOptions): StoreOptions {
        return body;
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
            return this.user.roles.map(role => role.role).join(delimiter);
        }
    }
}

export type UserStoreOptions = Partial<UserStore>;
