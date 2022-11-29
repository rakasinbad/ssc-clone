export interface IConfirmOrderPaymentParcels {
    orderParcelId: number;
    paymentTypeSupplierMethodId: number;
    paymentTypeId: number;
    paymentChannelId: number;
    paylaterTypeId: number;
}

export interface IConfirmOrderPayment {
    orderId: number;
    storeId: number;
    parcels: IConfirmOrderPaymentParcels[]
}

/**
 * PAYMENT TYPE :
 * 1. Pay Now
 * 2. Pay Later
 * 3. Pay on Delivery
 */
export const PAYMENT_TYPE = {
    PAY_NOW: 1,
    PAY_LATER: 2,
    PAY_ON_DELIVERY: 3
}
