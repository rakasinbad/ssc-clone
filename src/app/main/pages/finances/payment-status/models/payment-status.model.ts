export interface IStatusPayment {
    totalOrder: string;
    totalWaitingForPaymentOrder: string;
    totalD7PaymentOrder: string;
    totalD3PaymentOrder: string;
    totalD0PaymentOrder: string;
    totalPaidOrder: string;
    totalPaymentFailedOrder: string;
    totalOverdueOrder: string;
    totalWaitingForRefund: string;
    totalRefunded: string;
}

export interface IPaymentStatusDemo {
    id: string;
    orderRef: string;
    store: string;
    receivable: string;
    status: string;
    paymentType: string;
    paymentMethod: string;
    orderDate: string;
    dueDate: string;
    paidOn: string;
    agingDay: string;
    d: string;
    proofOfPaymentStatus: string;
}
