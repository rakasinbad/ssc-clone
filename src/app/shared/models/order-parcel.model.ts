import { EStatusOrder, EStatusPayment } from './global.model';
import { InvoiceGroup } from './invoice-group.model';
import { ITimestamp } from './timestamp.model';

interface IOrderParcel extends ITimestamp {
    readonly id: NonNullable<string>;
    supplierId: NonNullable<string>;
    invoiceGroupId: string;
    lastMileId: string;
    promoId: string;
    customerHierarchyId: string;
    orderCancelReasonId: string;
    orderId: string;
    paymentTypeSupplierMethodId: string;
    leadTimePreparation: string;
    leadTimeDelivery: string;
    deliveredTime: string;
    lastMileFee: string;
    lastMileFeeFinal: string;
    orderNotes: string;
    orderCode: string;
    orderRef: string;
    paidTime: string;
    expiredPaymentTime: string;
    cancelBy: string;
    statusPayment: EStatusPayment;
    dueDate: string;
    status: EStatusOrder;
    statusUpdate: string;
    orderBrands: any;
    invoiceGroup: InvoiceGroup;
    orderCancelReason: string;
    orderParcelLogs: any;
    paymentTypeSupplierMethod: string;
    totalPrice: string;
    totalQty: string;
    agingDay: string;
    dueDay: string;
}
