export interface IStatusPayment {
    totalOrder: number;
    totalWaitingForPaymentOrder: number;
    totalD7PaymentOrder: number;
    totalD3PaymentOrder: number;
    totalD0PaymentOrder: number;
    totalPaidOrder: number;
    totalPaymentFailedOrder: number;
    totalOverdueOrder: number;
    totalWaitingForRefund: number;
    totalRefunded: number;
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

export enum EPaymentStatus {
    PAYMENT_FAILED = 'payment_failed',
    PAID = 'paid',
    WAITING_FOR_PAYMENT = 'waiting_for_payment',
    OVERDUE = 'overdue',
    WAITING_FOR_REFUND = 'waiting_for_refund',
    REFUNDED = 'refunded'
}
