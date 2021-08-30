import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

type PromoHierarchyStatus = 'active' | 'inactive';
type ApprovalTypeStatus = 'approved' | 'pending' | 'reject';

export interface ICalculateCollectionStatusPayment {
    status: string;
    title: string;
    detail: string;
    total: number;
}

interface IFinanceCollectionStatus {
    id: string;
    supplierId: string;
    supplierName: string;
    collectionCode: string;
    collectionMethodName: string;
    referenceCode: string;
    totalAmount: number;
    createdAt: string;
    invalidDate: string; //NonNullable<string>
    approvalStatus: string;
    salesmanName: string;
    storeExternalId: string;
    storeName: string;
    orderCode: Array<any>;
    orderRef: Array<any>;
    reason: string;
}

interface userModels {
    id: number;
    fullName: string;
}

interface principalModels {
    id: number;
    externalId: string;
}

interface stampModels {
    id: number;
    nominal: number;
}

interface financeCollectionMethod {
    id: number;
    collectionCode: string;
    collectionRef: string;
    amount: number;
    balance: number;
    approvalStatus: string;
    createdAt: string;
    user: userModels;
}

interface orderParcelModels {
    id: number;
    orderCode: string;
    orderDueDate: string;
    paymentStatus: string;
    orderRef: string;
    deliveredParcelFinalPriceBuyer: string;
    order: orderModels;
}

interface orderModels {
    id: number;
    store: storeModels;
}

interface storeModels {
    id: number;
    name: string;
}

interface billingModels {
    id: number;
    orderParcel: orderParcelModels;
}

interface IFinanceBillingStatus {
    id: string;
    stampNominal: number;
    reason: string;
    paidByCollectionMethod: number;
    paidAmount: number;
    billingPaymentCode: string;
    createdAt: string;
    approvalStatus: string;
    paymentCollectionMethod: financeCollectionMethod;
    principal: principalModels;
    stamp: stampModels;
    billing: billingModels;
}

export class CollectionStatus {
    id: string;
    supplierId: string;
    supplierName: string;
    collectionCode: string;
    collectionMethodName: string;
    referenceCode: string;
    totalAmount: number;
    createdAt: string;
    invalidDate: string; //NonNullable<string>
    approvalStatus: string;
    salesmanName: string;
    storeExternalId: string;
    storeName: string;
    orderCode: Array<any>;
    orderRef: Array<any>;
    reason: string;

    constructor(data: IFinanceCollectionStatus) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            supplierId,
            supplierName,
            collectionCode,
            collectionMethodName,
            referenceCode,
            totalAmount,
            createdAt,
            invalidDate,
            approvalStatus,
            salesmanName,
            storeExternalId,
            storeName,
            orderCode,
            orderRef,
            reason,
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.collectionCode = collectionCode;
        this.collectionMethodName = collectionMethodName;
        this.referenceCode = referenceCode;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
        this.invalidDate = invalidDate || null;
        this.approvalStatus = approvalStatus;
        this.salesmanName = salesmanName;
        this.storeExternalId = storeExternalId;
        this.storeName = storeName;
        this.orderCode = orderCode;
        this.orderRef = orderRef;
        this.reason = reason;
    }
}

export class BillingStatus {
    id: string;
    stampNominal: number;
    reason: string;
    paidByCollectionMethod: number;
    paidAmount: number;
    billingPaymentCode: string;
    createdAt: string;
    approvalStatus: string;
    paymentCollectionMethod: financeCollectionMethod;
    principal: principalModels;
    stamp: stampModels;
    billing: billingModels;

    constructor(data: IFinanceBillingStatus) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            stampNominal,
            reason,
            paidByCollectionMethod,
            paidAmount,
            billingPaymentCode,
            createdAt,
            approvalStatus,
            paymentCollectionMethod,
            principal,
            stamp,
            billing,
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.stampNominal = stampNominal;
        this.reason = reason;
        this.paidByCollectionMethod = paidByCollectionMethod;
        this.paidAmount = paidAmount;
        this.billingPaymentCode = billingPaymentCode;
        this.createdAt = createdAt;
        this.approvalStatus = approvalStatus;
        this.paymentCollectionMethod = paymentCollectionMethod;
        this.principal = principal;
        this.stamp = stamp;
        this.billing = billing;
    }
}

interface IFinanceCollectionPayload {
    [key: string]: any;
}

export class FinanceCollectionPayload implements IFinanceCollectionPayload {
    [key: string]: any;
}

interface IFinanceBillingPayload {
    [key: string]: any;
}

export class FinanceBillingPayload implements IFinanceBillingPayload {
    [key: string]: any;
}

export interface paymentCollectionMethodModels {
    collectionCode: string;
    collectionRefNo: string;
    amount: number;
    stamp: stampDetailModels;
    totalAmount: number;
    usedAmount: number;
    collectionDate: string;
    paymentCollectionType: paymentCollectionTypeModels;
    bankFrom: bankFromModels;
    date: string;
    dueDate: string;
    approvalStatus: string;
    reason: string;
    user: userDetailModels;
}

export interface stampDetailModels {
    id: number;
    name: string;
    nominal: number;
}

export interface paymentCollectionTypeModels {
    id: number;
    name: string;
    code: string;
}

export interface bankFromModels {
    id: number;
    name: string;
    displayName: string;
}

export interface userDetailModels {
    id: number;
    name: string;
}

export interface billingPaymentModels {
    externalId: number;
    storeName: string;
    orderCode: string;
    orderRef: string;
    totalAmount: number;
    dueDate: string;
    paymentStatus: string;
    salesRepName: string;
    billingCode: string;
    billingAmount: number;
    stampNominal: number;
    totalBillingAmount: number;
    billingDate: string;
    approvalStatus: string;
    reason: string;
}

interface IFinanceDetailCollection {
    id: string;
    paymentCollectionMethod: paymentCollectionMethodModels;
    billingPayment: billingPaymentModels[];
}

export class FinanceDetailCollection {
    id: string;
    paymentCollectionMethod: paymentCollectionMethodModels;
    billingPayment: billingPaymentModels[];

    constructor(data: IFinanceDetailCollection) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            paymentCollectionMethod,
            billingPayment
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.paymentCollectionMethod = paymentCollectionMethod;
        this.billingPayment = billingPayment;

    }
}