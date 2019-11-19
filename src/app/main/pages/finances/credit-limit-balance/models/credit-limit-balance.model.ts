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
        private _id: string,
        private _storeId: string,
        private _creditLimitGroupId: string,
        private _creditLimit: string,
        private _balanceAmount: string,
        private _freezeStatus: boolean,
        private _termOfPayment: number,
        private _creditLimitStoreId: string,
        private _creditLimitGroup: CreditLimitGroup,
        private _store: Merchant,
        private _averageOrder: number,
        private _totalPrice: number,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this._creditLimitGroup = _creditLimitGroup
            ? new CreditLimitGroup(
                  _creditLimitGroup.id,
                  _creditLimitGroup.supplierId,
                  _creditLimitGroup.customerHierarchyId,
                  _creditLimitGroup.storeSegmentId,
                  _creditLimitGroup.name,
                  _creditLimitGroup.defaultCreditLimit,
                  _creditLimitGroup.defaultBalanceAmount,
                  _creditLimitGroup.termOfPayment,
                  _creditLimitGroup.creditLimitAreas,
                  _creditLimitGroup.storeSegment,
                  _creditLimitGroup.createdAt,
                  _creditLimitGroup.updatedAt,
                  _creditLimitGroup.deletedAt
              )
            : null;

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

            this._store = newStore;
        } else {
            this._store = null;
        }
    }

    get id(): string {
        return this._id;
    }

    get storeId(): string {
        return this._storeId;
    }

    get creditLimitGroupId(): string {
        return this._creditLimitGroupId;
    }

    get creditLimit(): string {
        return this._creditLimit;
    }

    get balanceAmount(): string {
        return this._balanceAmount;
    }

    get freezeStatus(): boolean {
        return this._freezeStatus;
    }

    get termOfPayment(): number {
        return this._termOfPayment;
    }

    get creditLimitStoreId(): string {
        return this._creditLimitStoreId;
    }

    get creditLimitGroup(): CreditLimitGroup {
        return this._creditLimitGroup;
    }

    get store(): Merchant {
        return this._store;
    }

    get averageOrder(): number {
        return this._averageOrder;
    }

    get totalPrice(): number {
        return this._totalPrice;
    }

    static patch(body: CreditLimitStoreOptions): CreditLimitStoreOptions {
        return body;
    }
}

export type CreditLimitStoreOptions = Partial<CreditLimitStore>;

export class CreditLimitGroup extends Timestamp implements ICreditLimitGroup {
    constructor(
        private _id: string,
        private _supplierId: string,
        private _customerHierarchyId: string,
        private _storeSegmentId: string,
        private _name: string,
        private _defaultCreditLimit: string,
        private _defaultBalanceAmount: string,
        private _termOfPayment: number,
        private _creditLimitAreas: CreditLimitArea[],
        private _storeSegment: StoreSegment,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this._creditLimitAreas =
            _creditLimitAreas && _creditLimitAreas.length > 0
                ? _creditLimitAreas.map(row => {
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

        this._storeSegment = _storeSegment
            ? new StoreSegment(
                  _storeSegment.id,
                  _storeSegment.name,
                  _storeSegment.createdAt,
                  _storeSegment.updatedAt,
                  _storeSegment.deletedAt
              )
            : null;
    }

    get id(): string {
        return this._id;
    }

    get supplierId(): string {
        return this._supplierId;
    }

    get customerHierarchyId(): string {
        return this._customerHierarchyId;
    }

    get storeSegmentId(): string {
        return this._storeSegmentId;
    }

    get name(): string {
        return this._name;
    }

    get defaultCreditLimit(): string {
        return this._defaultCreditLimit;
    }

    get defaultBalanceAmount(): string {
        return this._defaultBalanceAmount;
    }

    get termOfPayment(): number {
        return this._termOfPayment;
    }

    get creditLimitAreas(): CreditLimitArea[] {
        return this._creditLimitAreas;
    }

    get storeSegment(): StoreSegment {
        return this._storeSegment;
    }
}

export type CreditLimitGroupOptions = Partial<CreditLimitGroup>;

export class CreditLimitArea extends Timestamp implements ICreditLimitArea {
    constructor(
        private _id: string,
        private _creditLimitGroupId: string,
        private _unitType: string,
        private _unitValue: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this._unitType = _unitType ? _unitType.trim() : _unitType;
        this._unitValue = _unitValue ? _unitValue.trim() : _unitValue;
    }

    get id(): string {
        return this._id;
    }

    get creditLimitGroupId(): string {
        return this._creditLimitGroupId;
    }

    get unitType(): string {
        return this._unitType;
    }

    get unitValue(): string {
        return this._unitValue;
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
