import { Injectable } from '@angular/core';
import { CreateManualOrder, IConfirmOrderPayment, OrderStoreAndInformation, ProductList } from '../models';

const OrderStoreAndShipmentInfoKey = 'OMS.createOrder.orderStoreAndShipmentInfo';
const OrderDataListKey = 'OMS.createOrder.orderDataList';
const OrderDataListResetKey = 'OMS.createOrder.orderDataListReset';
const OrderCheckoutPayloadKey = 'OMS.createOrder.orderCheckoutPayload';
const OrderConfirmPaymentPayloadKey = 'OMS.createOrder.orderConfirmPaymentPayload'

@Injectable({
    providedIn: 'root'
})
export class OrderHelperService {
    
    constructor() {}

    /* STORE AND SHIPMENT INFORMATION */
    getOrderStoreAndShipmentInformation(): OrderStoreAndInformation {
        return JSON.parse(localStorage.getItem(OrderStoreAndShipmentInfoKey));
    }

    setOrderStoreAndShipmentInformation(items: OrderStoreAndInformation): void {
        localStorage.setItem(OrderStoreAndShipmentInfoKey, JSON.stringify(items));
    }

    removeOrderStoreAndShipmentInformation(): void {
        localStorage.removeItem(OrderStoreAndShipmentInfoKey);
    }
    
    /* ORDER ADD */
    getOrderDataList(): ProductList[] {
        return JSON.parse(localStorage.getItem(OrderDataListKey));
    }

    setOrderDataList(items: ProductList[]): void {
        localStorage.setItem(OrderDataListKey, JSON.stringify(items));
    }

    removeOrderDataList(): void {
        localStorage.removeItem(OrderDataListKey);
    }
    
    /* ORDER PREVIEW */
    getOrderCheckoutPayload(): CreateManualOrder {
        return JSON.parse(localStorage.getItem(OrderCheckoutPayloadKey));
    }

    setOrderCheckoutPayload(items: CreateManualOrder): void {
        localStorage.setItem(OrderCheckoutPayloadKey, JSON.stringify(items));
    }

    removeOrderCheckoutPayload(): void {
        localStorage.removeItem(OrderCheckoutPayloadKey);
    }
    
    /* CONFIRM ORDER PAYMENT */
    getOrderConfirmPaymentPayload(): IConfirmOrderPayment {
        return JSON.parse(localStorage.getItem(OrderConfirmPaymentPayloadKey));
    }

    setOrderConfirmPaymentPayload(items: IConfirmOrderPayment): void {
        return localStorage.setItem(OrderConfirmPaymentPayloadKey, JSON.stringify(items));
    }

    removeOrderConfirmPaymentPayload(): void {
        localStorage.removeItem(OrderConfirmPaymentPayloadKey);
    }

    /* RESET FORM CREATE ORDER */
    resetFormCreateOrder() {
        this.removeOrderStoreAndShipmentInformation();
        this.removeOrderCheckoutPayload();
        this.removeOrderDataList();
        this.removeOrderConfirmPaymentPayload();
        this.removeOrderDataListReset();
    }

    /* RESET FORM CREATE ORDER ON CHANGE ORDER DATE & STORE NAME */
    resetFormCreateOrderOnChangeOrderDateAndStoreName() {
        this.removeOrderCheckoutPayload();
        this.removeOrderDataList();
        this.removeOrderConfirmPaymentPayload();
    }

    /* ORDER LIST RESET */
    getOrderDataListReset(): boolean {
        return JSON.parse(localStorage.getItem(OrderDataListResetKey));
    }

    setOrderDataListReset(value: boolean): void {
        localStorage.setItem(OrderDataListResetKey, JSON.stringify(value));
    }

    removeOrderDataListReset(): void {
        localStorage.removeItem(OrderDataListResetKey);
    }
}
