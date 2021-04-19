// checkout, cancel, confirm, pending, packing, shipping, delivered, done
export type OrderStatus =
    | 'cancel'
    | 'checkout'
    | 'confirm'
    | 'delivered'
    | 'done'
    | 'packing'
    | 'pending'
    | 'pending_payment'
    | 'pending_supplier'
    | 'shipping';

export interface IOrderStatusSource {
    detail: string;
    status: OrderStatus | null;
    title: string;
}

export class OrderStatusSource implements IOrderStatusSource {
    detail: string;
    status: OrderStatus | null;
    title: string;

    constructor(data: IOrderStatusSource) {
        const { detail, status, title } = data;

        this.detail = (detail && detail.trim()) || null;
        this.status = status;
        this.title = (title && title.trim()) || null;
    }
}
