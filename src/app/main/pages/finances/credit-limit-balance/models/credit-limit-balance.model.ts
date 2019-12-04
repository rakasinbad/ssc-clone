import { Store as Merchant } from 'app/main/pages/accounts/merchants/models';
import {
    InvoiceGroup,
    IResponsePaginate,
    ITimestamp,
    StoreSegment,
    TNullable
} from 'app/shared/models';

interface ICreditLimitStore extends ITimestamp {
    readonly id: NonNullable<string>;
    storeId: string;
    invoiceGroupId: string;
    creditLimitGroupId: string;
    creditLimit: string;
    balanceAmount: string;
    freezeStatus: boolean;
    allowCreditLimit: boolean;
    termOfPayment: number;
    creditLimitGroupChanged: string;
    updatedCreditLimit: string;
    creditLimitGroup: CreditLimitGroup;
    invoiceGroup: InvoiceGroup;
    store?: Merchant;
    averageOrder: number;
    totalOrder: number;
}

interface ICreditLimitGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    supplierId: string;
    hierarchyId: string;
    storeSegmentId: string;
    name: string;
    defaultCreditLimit: string;
    defaultBalanceAmount: string;
    termOfPayment: number;
    creditLimitAreas: CreditLimitArea[];
    storeSegment: StoreSegment;
}

interface ICreditLimitArea extends ITimestamp {
    readonly id: NonNullable<string>;
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

export class CreditLimitStore implements ICreditLimitStore {
    readonly id: NonNullable<string>;
    storeId: string;
    invoiceGroupId: string;
    creditLimitGroupId: string;
    creditLimit: string;
    balanceAmount: string;
    freezeStatus: boolean;
    allowCreditLimit: boolean;
    termOfPayment: number;
    creditLimitGroupChanged: string;
    updatedCreditLimit: string;
    creditLimitGroup: CreditLimitGroup;
    invoiceGroup: InvoiceGroup;
    store?: Merchant;
    averageOrder: number;
    totalOrder: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: CreditLimitStore) {
        const {
            id,
            storeId,
            invoiceGroupId,
            creditLimitGroupId,
            creditLimit,
            balanceAmount,
            freezeStatus,
            allowCreditLimit,
            termOfPayment,
            creditLimitGroupChanged,
            updatedCreditLimit,
            creditLimitGroup,
            invoiceGroup,
            store,
            averageOrder,
            totalOrder,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.storeId = storeId;
        this.invoiceGroupId = invoiceGroupId;
        this.creditLimitGroupId = creditLimitGroupId;
        this.creditLimit = creditLimit;
        this.balanceAmount = balanceAmount;
        this.freezeStatus = freezeStatus;
        this.allowCreditLimit = allowCreditLimit;
        this.termOfPayment = termOfPayment;
        this.creditLimitGroupChanged = creditLimitGroupChanged;
        this.updatedCreditLimit = updatedCreditLimit;
        this.creditLimitGroup = creditLimitGroup;
        this.invoiceGroup = invoiceGroup;
        this.averageOrder = averageOrder;
        this.totalOrder = totalOrder;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.creditLimitGroup = creditLimitGroup ? new CreditLimitGroup(creditLimitGroup) : null;
        this.invoiceGroup = invoiceGroup ? new InvoiceGroup(invoiceGroup) : null;
        this.store = store ? new Merchant(store) : null;
    }

    static patch(body: CreditLimitStoreOptions): CreditLimitStoreOptions {
        return body;
    }
}

export type CreditLimitStoreOptions = Partial<CreditLimitStore>;

export class CreditLimitGroup implements ICreditLimitGroup {
    readonly id: NonNullable<string>;
    supplierId: string;
    hierarchyId: string;
    storeSegmentId: string;
    name: string;
    defaultCreditLimit: string;
    defaultBalanceAmount: string;
    termOfPayment: number;
    creditLimitAreas: CreditLimitArea[];
    storeSegment: StoreSegment;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: CreditLimitGroup) {
        const {
            id,
            supplierId,
            hierarchyId,
            storeSegmentId,
            name,
            defaultCreditLimit,
            defaultBalanceAmount,
            termOfPayment,
            creditLimitAreas,
            storeSegment,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.supplierId = supplierId;
        this.hierarchyId = hierarchyId;
        this.storeSegmentId = storeSegmentId;
        this.name = name ? String(name).trim() : null;
        this.defaultCreditLimit = defaultCreditLimit;
        this.defaultBalanceAmount = defaultBalanceAmount;
        this.termOfPayment = termOfPayment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.creditLimitAreas =
            creditLimitAreas && creditLimitAreas.length > 0
                ? creditLimitAreas.map(row => {
                      return new CreditLimitArea(row);
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
