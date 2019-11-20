import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';
import {
    IResponsePaginate,
    ITimestamp,
    StoreSegment,
    Timestamp,
    TNullable
} from 'app/shared/models';

interface ICreditLimitStore extends ITimestamp {
    id: string;
    storeId: string;
    creditLimitGroupId: string;
    creditLimit: string;
    balanceAmount: string;
    freezeStatus: boolean;
    termOfPayment: number;
    creditLimitStoreId: string;
    creditLimitGroup: CreditLimitGroup;
    store: Merchant;
    averageOrder: number;
    totalPrice: number;
}

interface ICreditLimitGroup extends ITimestamp {
    id: string;
    supplierId: string;
    customerHierarchyId: string;
    storeSegmentId: string;
    name: string;
    defaultCreditLimit: string;
    defaultBalanceAmount: string;
    termOfPayment: number;
    creditLimitAreas: CreditLimitArea[];
    storeSegment: StoreSegment;
}

interface ICreditLimitArea extends ITimestamp {
    id: string;
    creditLimitGroupId: string;
    unitType: string;
    unitValue: string;
}

export interface ICreditLimitStoreResponse extends IResponsePaginate {
    data: ICreditLimitStore[];
}

export interface ICreditLimitGroupResponse extends IResponsePaginate {
    data: ICreditLimitGroup[];
}

export interface ICreditLimitAreaResponse extends IResponsePaginate {
    data: ICreditLimitArea[];
}

export class CreditLimitStore extends Timestamp implements ICreditLimitStore {
    constructor(
        public id: string,
        public storeId: string,
        public creditLimitGroupId: string,
        public creditLimit: string,
        public balanceAmount: string,
        public freezeStatus: boolean,
        public termOfPayment: number,
        public creditLimitStoreId: string,
        public creditLimitGroup: CreditLimitGroup,
        public store: Merchant,
        public averageOrder: number,
        public totalPrice: number,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.creditLimitGroup = creditLimitGroup
            ? new CreditLimitGroup(
                  creditLimitGroup.id,
                  creditLimitGroup.supplierId,
                  creditLimitGroup.customerHierarchyId,
                  creditLimitGroup.storeSegmentId,
                  creditLimitGroup.name,
                  creditLimitGroup.defaultCreditLimit,
                  creditLimitGroup.defaultBalanceAmount,
                  creditLimitGroup.termOfPayment,
                  creditLimitGroup.creditLimitAreas,
                  creditLimitGroup.storeSegment,
                  creditLimitGroup.createdAt,
                  creditLimitGroup.updatedAt,
                  creditLimitGroup.deletedAt
              )
            : null;

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

    static patch(body: CreditLimitStoreOptions): CreditLimitStoreOptions {
        return body;
    }
}

export type CreditLimitStoreOptions = Partial<CreditLimitStore>;

export class CreditLimitGroup extends Timestamp implements ICreditLimitGroup {
    constructor(
        public id: string,
        public supplierId: string,
        public customerHierarchyId: string,
        public storeSegmentId: string,
        public name: string,
        public defaultCreditLimit: string,
        public defaultBalanceAmount: string,
        public termOfPayment: number,
        public creditLimitAreas: CreditLimitArea[],
        public storeSegment: StoreSegment,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.creditLimitAreas =
            creditLimitAreas && creditLimitAreas.length > 0
                ? creditLimitAreas.map(row => {
                      return new CreditLimitArea(
                          row.id,
                          row.creditLimitGroupId,
                          row.unitType,
                          row.unitValue,
                          row.createdAt,
                          row.updatedAt,
                          row.deletedAt
                      );
                  })
                : [];

        this.storeSegment = storeSegment
            ? new StoreSegment(
                  storeSegment.id,
                  storeSegment.name,
                  storeSegment.createdAt,
                  storeSegment.updatedAt,
                  storeSegment.deletedAt
              )
            : null;
    }
}

export type CreditLimitGroupOptions = Partial<CreditLimitGroup>;

export class CreditLimitArea extends Timestamp implements ICreditLimitArea {
    constructor(
        public id: string,
        public creditLimitGroupId: string,
        public unitType: string,
        public unitValue: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.unitType = unitType ? unitType.trim() : unitType;
        this.unitValue = unitValue ? unitValue.trim() : unitValue;
    }
}

export type CreditLimitAreaOptions = Partial<CreditLimitArea>;

// -----------------------------------------------------------------------------------------------------
// For Demo
// -----------------------------------------------------------------------------------------------------

export interface ICreditLimitBalanceDemo {
    id: string;
    storeName: string;
    creditLimit: string;
    balance: string;
    accountReceivable: string;
    group: string;
    segment: string;
    top: string;
    lastUpdate: string;
}
