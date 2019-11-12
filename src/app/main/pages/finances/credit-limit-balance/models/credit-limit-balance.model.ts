import { IResponsePaginate, ITimestamp, Timestamp, TNullable } from 'app/shared/models';

export interface ICreditLimitGroup extends ITimestamp {
    id?: string;
    brandId: string;
    customerHierarchyId: string;
    storeSegmentId: string;
    name: string;
    defaultCreditLimit: string;
    defaultBalanceAmount: string;
    termOfPayment: number;
    creditLimitAreas: ICreditLimitArea[];
}

export interface ICreditLimitArea extends ITimestamp {
    id?: string;
    creditLimitGroupId?: string;
    unitType: string;
    unitValue: string;
}

export interface ICreditLimitGroupResponse extends IResponsePaginate {
    data: ICreditLimitGroup[];
}

export interface ICreditLimitArea extends IResponsePaginate {
    data: ICreditLimitArea[];
}

export class CreditLimitGroup extends Timestamp {
    id?: string;
    brandId: string;
    customerHierarchyId: string;
    storeSegmentId: string;
    name: string;
    defaultCreditLimit: string;
    defaultBalanceAmount: string;
    termOfPayment: number;
    creditLimitAreas: CreditLimitArea[];

    constructor(
        brandId: string,
        customerHierarchyId: string,
        storeSegmentId: string,
        name: string,
        defaultCreditLimit: string,
        defaultBalanceAmount: string,
        termOfPayment: number,
        creditLimitAreas: CreditLimitArea[],
        id?: string,
        createdAt?: string,
        updatedAt?: string,
        deletedAt?: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.brandId = brandId;
        this.customerHierarchyId = customerHierarchyId;
        this.storeSegmentId = storeSegmentId;
        this.name = name ? name.trim() : name;
        this.defaultCreditLimit = defaultCreditLimit;
        this.defaultBalanceAmount = defaultBalanceAmount;
        this.termOfPayment = termOfPayment;
        this.creditLimitAreas =
            creditLimitAreas && creditLimitAreas.length > 0
                ? [
                      ...creditLimitAreas.map(row => {
                          return {
                              ...new CreditLimitArea(
                                  row.unitType,
                                  row.unitValue,
                                  row.id,
                                  row.creditLimitGroupId,
                                  row.createdAt,
                                  row.updatedAt,
                                  row.deletedAt
                              )
                          };
                      })
                  ]
                : creditLimitAreas;

        if (id) {
            this.id = id;
        }

        if (createdAt) {
            this.createdAt = createdAt;
        }

        if (updatedAt) {
            this.updatedAt = updatedAt;
        }

        if (deletedAt) {
            this.deletedAt = deletedAt;
        }
    }
}

export class CreditLimitArea extends Timestamp {
    id?: string;
    creditLimitGroupId?: string;
    unitType: string;
    unitValue: string;

    constructor(
        unitType: string,
        unitValue: string,
        id?: string,
        creditLimitGroupId?: string,
        createdAt?: string,
        updatedAt?: string,
        deletedAt?: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.unitType = unitType ? unitType.trim() : unitType;
        this.unitValue = unitValue ? unitValue.trim() : unitValue;

        if (id) {
            this.id = id;
        }

        if (creditLimitGroupId) {
            this.creditLimitGroupId = creditLimitGroupId;
        }

        if (createdAt) {
            this.createdAt = createdAt;
        }

        if (updatedAt) {
            this.updatedAt = updatedAt;
        }

        if (deletedAt) {
            this.deletedAt = deletedAt;
        }
    }
}

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
