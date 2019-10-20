import { TStatusOrderDemo } from 'app/shared/models';

export interface IOrderDemo {
    origins: string;
    id: string;
    orderDate: string;
    storeName: string;
    trxAmount: string;
    paymentMethod: string;
    totalProduct: number;
    status: TStatusOrderDemo;
    deliveredOn: string;
    actualAmountDelivered: string;
}
