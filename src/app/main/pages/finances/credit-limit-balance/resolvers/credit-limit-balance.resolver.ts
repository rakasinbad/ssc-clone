import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { GeneratorService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { CreditLimitBalanceActions } from '../store/actions';
import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class CreditLimitBalanceResolver implements Resolve<any> {
    constructor(
        private store: Store<fromCreditLimitBalance.FeatureState>,
        private _$generator: GeneratorService
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        return this.store.select(CreditLimitBalanceSelectors.getTotalCreditLimitBalanceEntity).pipe(
            tap(total => {
                if (!total) {
                    const generator = this._$generator.generator(
                        GeneratorService.financeStoresSchema,
                        5,
                        50
                    );

                    this.store.dispatch(
                        CreditLimitBalanceActions.generateCreditLimitBalanceDemo({
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
