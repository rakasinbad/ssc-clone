import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';
import {
    InvoiceGroup,
    IResponsePaginate,
    ITimestamp,
    StoreSegment,
    TNullable
} from 'app/shared/models';

export interface ICreditLimitStore extends ITimestamp {
    readonly id: NonNullable<string>;
    allowCreditLimit: boolean;
    averageOrder: number;
    balanceAmount: string;
    creditLimit: string;
    creditLimitGroup: CreditLimitGroup;
    creditLimitGroupChanged: string;
    creditLimitGroupId: string;
    freezeStatus: boolean;
    invoiceGroup: InvoiceGroup;
    invoiceGroupId: string;
    store?: Merchant;
    storeId: string;
    termOfPayment: number;
    totalOrder: number;
    updatedCreditLimit: string;
}

export interface ICreditLimitStoreResponse extends IResponsePaginate {
    data: Array<ICreditLimitStore>;
}

export class CreditLimitStore implements ICreditLimitStore {
    readonly id: NonNullable<string>;
    allowCreditLimit: boolean;
    averageOrder: number;
    balanceAmount: string;
    creditLimit: string;
    creditLimitGroup: CreditLimitGroup;
    creditLimitGroupChanged: string;
    creditLimitGroupId: string;
    freezeStatus: boolean;
    invoiceGroup: InvoiceGroup;
    invoiceGroupId: string;
    store?: Merchant;
    storeId: string;
    termOfPayment: number;
    totalOrder: number;
    updatedCreditLimit: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: ICreditLimitStore) {
        const {
            id,
            allowCreditLimit,
            averageOrder,
            balanceAmount,
            creditLimit,
            creditLimitGroup,
            creditLimitGroupChanged,
            creditLimitGroupId,
            freezeStatus,
            invoiceGroup,
            invoiceGroupId,
            store,
            storeId,
            termOfPayment,
            totalOrder,
            updatedCreditLimit,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.allowCreditLimit = allowCreditLimit;
        this.averageOrder = averageOrder;
        this.balanceAmount = balanceAmount;
        this.creditLimit = creditLimit;
        this.creditLimitGroup = creditLimitGroup;
        this.creditLimitGroupChanged = creditLimitGroupChanged;
        this.creditLimitGroupId = creditLimitGroupId;
        this.freezeStatus = freezeStatus;
        this.invoiceGroup = invoiceGroup;
        this.invoiceGroupId = invoiceGroupId;
        this.setCreditLimitGroup = creditLimitGroup;
        this.setInvoiceGroup = invoiceGroup;
        this.setStore = store;
        this.storeId = storeId;
        this.termOfPayment = termOfPayment;
        this.totalOrder = totalOrder;
        this.updatedCreditLimit = updatedCreditLimit;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setCreditLimitGroup(value: CreditLimitGroup) {
        this.creditLimitGroup = value ? new CreditLimitGroup(value) : null;
    }

    set setInvoiceGroup(value: InvoiceGroup) {
        this.invoiceGroup = value ? new InvoiceGroup(value) : null;
    }

    set setStore(value: Merchant) {
        this.store = value ? new Merchant(value) : null;
    }

    static patch(body: CreditLimitStoreOptions): CreditLimitStoreOptions {
        return body;
    }
}

export type CreditLimitStoreOptions = Partial<CreditLimitStore>;

export interface ICreditLimitGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    creditLimitAreas: Array<CreditLimitArea>;
    defaultBalanceAmount: string;
    defaultCreditLimit: string;
    hierarchyId: string;
    name: string;
    storeSegment: StoreSegment;
    storeSegmentId: string;
    supplierId: string;
    termOfPayment: number;
}

export interface ICreditLimitGroupResponse extends IResponsePaginate {
    data: Array<ICreditLimitGroup>;
}

export class CreditLimitGroup implements ICreditLimitGroup {
    readonly id: NonNullable<string>;
    creditLimitAreas: Array<CreditLimitArea>;
    defaultBalanceAmount: string;
    defaultCreditLimit: string;
    hierarchyId: string;
    name: string;
    storeSegment: StoreSegment;
    storeSegmentId: string;
    supplierId: string;
    termOfPayment: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: ICreditLimitGroup) {
        const {
            id,
            creditLimitAreas,
            defaultBalanceAmount,
            defaultCreditLimit,
            hierarchyId,
            name,
            storeSegment,
            storeSegmentId,
            supplierId,
            termOfPayment,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.defaultBalanceAmount = defaultBalanceAmount;
        this.defaultCreditLimit = defaultCreditLimit;
        this.hierarchyId = hierarchyId;
        this.name = name ? String(name).trim() : null;
        this.setCreditLimitAreas = creditLimitAreas;
        this.setStoreSegment = storeSegment;
        this.storeSegmentId = storeSegmentId;
        this.supplierId = supplierId;
        this.termOfPayment = termOfPayment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    set setCreditLimitAreas(value: Array<CreditLimitArea>) {
        this.creditLimitAreas =
            value && value.length > 0 ? value.map(row => new CreditLimitArea(row)) : [];
    }

    set setStoreSegment(value: StoreSegment) {
        this.storeSegment = value
            ? new StoreSegment(
                  value.id,
                  value.name,
                  value.createdAt,
                  value.updatedAt,
                  value.deletedAt
              )
            : null;
    }
}

export type CreditLimitGroupOptions = Partial<CreditLimitGroup>;

interface ICreditLimitAreaForm {
    creditLimitArea: Array<{ unitType: string; unitValue: string }>;
}

export type CreditLimitGroupForm = Pick<
    CreditLimitGroup,
    | 'name'
    | 'supplierId'
    | 'hierarchyId'
    | 'storeSegmentId'
    | 'defaultCreditLimit'
    | 'defaultBalanceAmount'
    | 'termOfPayment'
> &
    ICreditLimitAreaForm;

export interface ICreditLimitArea extends ITimestamp {
    readonly id: NonNullable<string>;
    creditLimitGroupId: string;
    unitType: string;
    unitValue: string;
}

export interface ICreditLimitAreaResponse extends IResponsePaginate {
    data: Array<ICreditLimitArea>;
}

export class CreditLimitArea implements ICreditLimitArea {
    readonly id: NonNullable<string>;
    creditLimitGroupId: string;
    unitType: string;
    unitValue: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: CreditLimitArea) {
        const {
            id,
            creditLimitGroupId,
            unitType,
            unitValue,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.creditLimitGroupId = creditLimitGroupId;
        this.unitType = unitType ? String(unitType).trim() : null;
        this.unitValue = unitValue ? String(unitValue).trim() : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
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
