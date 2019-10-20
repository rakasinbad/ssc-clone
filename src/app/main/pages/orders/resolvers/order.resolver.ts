import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { GeneratorService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { OrderActions } from '../store/actions';
import { fromOrder } from '../store/reducers';
import { OrderSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class OrderResolver implements Resolve<any> {
    constructor(
        private store: Store<fromOrder.FeatureState>,
        private _$generator: GeneratorService
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        return this.store.select(OrderSelectors.getTotalOrderEntity).pipe(
            tap(total => {
                console.log('RESOLVE TOTAL', total);
                if (!total) {
                    const generator = this._$generator.generator(
                        GeneratorService.orderSchema,
                        50,
                        200
                    );

                    console.log(generator);

                    this.store.dispatch(
                        OrderActions.generateOrdersDemo({
                            payload: generator
                        })
                    );
                }
            }),
            filter(total => !!total),
            first()
        );
    }
}
