export class FinanceDetailBillingV1 {
    id: number;
    paymentCollectionMethod: financeCollectionMethodV1;
    billingPayment: Array<billingPaymentModelV1>;
    data: IFinanceBillingStatusV1;
    constructor(data: IFinanceBillingStatusV1) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const { id, billingPayment, paymentCollectionMethod } = data;
        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        (this.id = id),
            (this.paymentCollectionMethod = paymentCollectionMethod),
            (this.billingPayment = billingPayment);
    }
}

//V1 Response
interface IFinanceBillingStatusV1 {
    id: number;
    paymentCollectionMethod: financeCollectionMethodV1;
    billingPayment: Array<billingPaymentModelV1>;
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
