import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

type PromoHierarchyStatus = 'active' | 'inactive';
type ApprovalTypeStatus = 'approved' | 'pending' | 'reject';

interface ICalculateCollectionStatusPayment {
    readonly id: NonNullable<string>;
    status: string;
    title: string;
    detail: string;
    total: number;
}

export class CalculateCollectionStatusPayment {
    readonly id: NonNullable<string>;
    status: string;
    title: string;
    detail: string;
    total: number;

    constructor(data: ICalculateCollectionStatusPayment) {
        const {id, status, title, detail, total } = data;
        this.id = id || null;
        this.status = status;
        this.title = title;
        this.detail = detail;
        this.total = total;
    }
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
    amount: number;
    approvalStatus: string;
    balance: number;
    collectionCode: string;
    createdAt: string;
    paymentCollectionTypeName: string;
    refNo: string;
    user: userModels;
    store: storeModels;
    supplier: supplierBilling;
    supplierStore: supplierStoreBilling;
    stampNominal: number;
}

interface orderParcelModels {
    id: number;
    deliveredParcelFinalPriceBuyer: number;
    dueDate: string;
    orderCode: string;
    orderRef: string;
    statusPayment: string;
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
    id: number;
    storeName: string;
    invoiceNumber: string;
    invoiceAmount: number;
    amountPaid: number
    collectionDate: string;
    invoiceDueDate: string;
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
    id: number;
    storeName: string;
    invoiceNumber: string;
    invoiceAmount: number;
    amountPaid: number;
    collectionDate: string;
    invoiceDueDate: string;

    constructor(data: IFinanceBillingStatus) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            storeName,
            invoiceNumber,
            invoiceAmount,
            amountPaid,
            collectionDate,
            invoiceDueDate,
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.storeName = storeName;
        this.invoiceNumber = invoiceNumber;
        this.invoiceAmount = invoiceAmount;
        this.amountPaid = amountPaid;
        this.collectionDate = collectionDate;
        this.invoiceDueDate = invoiceDueDate;
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

export interface IBank {
    id: number;
    name: string;
    code: string;
    displayName: string;
}

export interface IBankToAccount {
    accountNo: string;
    bank: IBank;
    bankCode: string;
    description: string;
    displayName: string;
    id: number;
}

export interface paymentCollectionMethodModels {
    id: number;
    refNo: string;
    collectionCode: string;
    collectionRef: string;
    amount: number;
    stamp: stampDetailModels;
    totalAmount: number;
    usedAmount: number;
    createdDate: string;
    paymentCollectionType: paymentCollectionTypeModels;
    bankFrom: bankFromModels;
    bankToAccount: IBankToAccount;
    date: string;
    dueDate: string;
    approvalStatus: string;
    balance: number;
    approvalReason: string;
    suplierResponse: supplierResponModels;
    salesRepCode: string;
    salesRepName: string;
    updatedBy: string;
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
    code: string;
    displayName: string;
}

export interface supplierResponModels {
    id: number;
    supplierId: number;
    storeId: number;
    StoreExternalId: string;
    name: string;
}

export interface supplierBilling {
    id: number;
    name: string;
}

export interface supplierStoreBilling {
    id: number;
    externalId: number;
}

export interface billingPaymentsModels {
    storeExternalId: number;
    storeName: string;
    orderCode: string;
    orderRef: string;
    totalAmount: number;
    dueDate: string;
    statusPayment: string;
    salesRepName: string;
    billingPaymentCode: string;
    billingAmount: number;
    stampNominal: number;
    totalBillingAmount: number;
    createdAt: string;
    approvalStatus: string;
    approvalReason: string;
}

interface IFinanceDetailCollection {
    id: string;
    paymentCollectionMethod: paymentCollectionMethodModels;
    billingPayments: billingPaymentsModels[];
}

export class FinanceDetailCollection {
    id: string;
    paymentCollectionMethod: paymentCollectionMethodModels;
    billingPayments: billingPaymentsModels[];
    data: IFinanceDetailCollection;

    constructor(data: IFinanceDetailCollection) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            paymentCollectionMethod,
            billingPayments
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.paymentCollectionMethod = paymentCollectionMethod;
        this.billingPayments = billingPayments;
    }

    static patch(body: CollectionDetailOptions): CollectionDetailOptions {
        return body;
    }

}

export type CollectionDetailOptions = Partial<FinanceDetailCollection>;