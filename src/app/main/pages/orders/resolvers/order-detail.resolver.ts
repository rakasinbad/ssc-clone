import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { fromOrder } from '../store/reducers';
import { OrderSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class OrderDetailResolver implements Resolve<any> {
    constructor(private store: Store<fromOrder.FeatureState>) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const { id } = route.params;

        if (!id) {
            return of(null);
        }

        return this.store.select(OrderSelectors.getSelectedOrder).pipe(
            tap(order => {
                if (!order) {
                    // this.store.dispatch(OrderActions.getOrderDemoDetail({ payload: id }));
                }
            }),
            filter(order => !!order),
            first()
        );
    }
}
