import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { GeneratorService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { PaymentStatusActions } from '../store/actions';
import { fromPaymentStatus } from '../store/reducers';
import { PaymentStatusSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class PaymentResolver implements Resolve<any> {
    constructor(
        private store: Store<fromPaymentStatus.FeatureState>,
        private _$generator: GeneratorService
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        return this.store.select(PaymentStatusSelectors.getTotalPaymentStatusEntity).pipe(
            tap(total => {
                console.log('PAYMENT 1', total);
                if (!total) {
                    const generator = this._$generator.generator(
                        GeneratorService.financePaymentStatusSchema,
                        50,
                        200
                    );

                    console.log('PAYMENT 2', generator);

                    this.store.dispatch(
                        PaymentStatusActions.generatePaymentsDemo({ payload: generator })
                    );
                }
            }),
            filter(total => !!total),
            first()
        );
    }
}
