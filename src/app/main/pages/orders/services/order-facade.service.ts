import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { OrderLineType } from 'app/shared/models/order-line-type.model';
import { Observable } from 'rxjs';
import { OrderActions } from '../store/actions';
import { fromOrder, fromCancelOrderReason } from '../store/reducers';
import { OrderSelectors, CancelOrderReasonSelectors } from '../store/selectors';
import { ICancelReason } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderFacadeService {
    isLoading$: Observable<boolean> = this.store.pipe(select(OrderSelectors.getIsLoading));
    order$: Observable<any> = this.store.pipe(select(OrderSelectors.getSelectedOrder));
    cancelOrderReason$: Observable<ICancelReason[]> = this.cancelOrderReasonStore.pipe(select(CancelOrderReasonSelectors.selectAll));
    isLoadingCancelOrderReason$: Observable<boolean> = this.cancelOrderReasonStore.pipe(select(CancelOrderReasonSelectors.getIsLoading));
    isConfirmedCancelOrder$: Observable<boolean> = this.cancelOrderReasonStore.pipe(select(CancelOrderReasonSelectors.getIsConfirmedCancelOrder));

    constructor(
        private store: Store<fromOrder.FeatureState>,
        private cancelOrderReasonStore: Store<fromCancelOrderReason.FeatureState>,
    ) {}

    getById(id: string): void {
        this.store.dispatch(OrderActions.fetchOrderRequest({ payload: id }));
    }

    getOrderBrandByType(type: OrderLineType): Observable<any[]> {
        return this.store.pipe(select(OrderSelectors.getOrderBrandCatalogue(type)));
    }

    clear(): void {
        this.store.dispatch(OrderActions.resetOrders());
    }

    changeOrderStatusWithReason(id: string, orderCode: string, cancelReason: ICancelReason): void {
        this.store.dispatch(OrderActions.confirmChangeStatusOrderWithReason({payload: {
            id, orderCode, cancelReason
        }}));
    }

    changeCataloguesQty(id:string, body:any):void {
        this.store.dispatch(OrderActions.confirmChangeOrder({payload: {
            id, body
        }}))
    }

    getCancelOrderReason() {
        this.store.dispatch(OrderActions.fetchCancelOrderReasonRequest({ payload: {} }))
    }
}
