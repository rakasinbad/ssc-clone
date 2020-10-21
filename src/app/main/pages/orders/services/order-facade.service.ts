import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { OrderLineType } from 'app/shared/models/order-line-type.model';
import { Observable } from 'rxjs';
import { OrderActions } from '../store/actions';
import { fromOrder } from '../store/reducers';
import { OrderSelectors } from '../store/selectors';

@Injectable({ providedIn: 'root' })
export class OrderFacadeService {
    isLoading$: Observable<boolean> = this.store.pipe(select(OrderSelectors.getIsLoading));
    order$: Observable<any> = this.store.pipe(select(OrderSelectors.getSelectedOrder));

    constructor(private store: Store<fromOrder.FeatureState>) {}

    getById(id: string): void {
        this.store.dispatch(OrderActions.fetchOrderRequest({ payload: id }));
    }

    getOrderBrandByType(type: OrderLineType): Observable<any[]> {
        return this.store.pipe(select(OrderSelectors.getOrderBrandCatalogue(type)));
    }

    clear(): void {
        this.store.dispatch(OrderActions.resetOrders());
    }
}