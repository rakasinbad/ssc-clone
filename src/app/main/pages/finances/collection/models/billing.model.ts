export class FinanceDetailBillingV1 {
    id: string;
    storeName: string;
    invoiceNumber: number;
    invoiceAmount: number;
    amountPaid: number;
    collectionDate: string;
    invoiceDueDate: string;
    oderReference: number;
    billingPayments: Array<IBillingPayments>;
    data: IFinanceDetailBillingV1;
    constructor(data: IFinanceDetailBillingV1) {
        const {
            id,
            storeName,
            invoiceNumber,
            invoiceAmount,
            amountPaid,
            collectionDate,
            invoiceDueDate,
            oderReference,
            billingPayments,
        } = data;
        (this.id = id),
            (this.storeName = storeName),
            (this.invoiceNumber = invoiceNumber),
            (this.invoiceAmount = invoiceAmount),
            (this.amountPaid = amountPaid),
            (this.collectionDate = collectionDate),
            (this.invoiceDueDate = invoiceDueDate),
            (this.oderReference = oderReference),
            (this.billingPayments = billingPayments);
    }
}

export interface IBillingPayments {
    amountPaid: number;
    billingApprovedDate: string;
    billingDate: string;
    billingPaymentId: number;
    collectionId: number;
    billingStatus: string;
    collectionApprovedDate: string;
    collectionCode: number;
    collectionStatus: string;
    paymentMethod: string;
    reason: string;
    salesRepName: string;
    updatedBy: string;
}
//V1 Response
interface IFinanceDetailBillingV1 {
    id: string;
    storeName: string;
    invoiceNumber: number;
    invoiceAmount: number;
    amountPaid: number;
    collectionDate: string;
    invoiceDueDate: string;
    oderReference: number;
    billingPayments: Array<IBillingPayments>;
}
export interface financeCollectionMethodV1 {
    id: number;
    refNo: string;
    collectionCode: string | null;
    collectionRef: null;
    amount: number;
    stamp: stampModelV1;
    totalAmount: number;
    usedAmount: number;
    createdDate: string;
    paymentCollectionType: paymentCollectionTypeModelV1;
    bankFrom: bankFromModelV1;
    bankToAccount: string | null;
    date: string;
    dueDate: string;
    approvalStatus: string;
    balance: number;
    approvalReason: string;
    supplierResponse: supplierResponseV1;
    salesRepCode: string;
    salesRepName: string;
    image: string;
}

interface billingPaymentModelV1 {
    storeExternalId: string;
    storeName: string;
    orderCode: string;
    orderRef: string | null;
    totalAmount: number;
    dueDate: string;
    statusPayment: string;
    salesRepName: string;
    billingPaymentCode: string | null;
    billingAmount: number;
    stampNominal: number;
    totalBillingAmount: number;
    createdAt: string;
    approvalStatus: string;
    approvalReason: null;
}

interface stampModelV1 {
    id: number;
    name: string;
    nominal: number;
}

interface paymentCollectionTypeModelV1 {
    id: number;
    name: string;
    code: string;
}

interface bankFromModelV1 {
    id: number;
    name: string;
    code: string;
    displayName: string;
}

interface supplierResponseV1 {
    id: number;
    supplierId: number;
    storeId: number;
    StoreExternalId: string;
    name: string;
}

//V1 Response