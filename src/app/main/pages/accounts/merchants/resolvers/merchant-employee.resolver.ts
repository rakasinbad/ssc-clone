import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { GeneratorService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { BrandStoreActions } from '../store/actions';
import { fromMerchant } from '../store/reducers';
import { BrandStoreSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class MerchantEmployeeResolver implements Resolve<any> {
    constructor(
        private store: Store<fromMerchant.FeatureState>,
        private _$generator: GeneratorService
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        return this.store.select(BrandStoreSelectors.getTotalStoreEmployeeEntity).pipe(
            tap(total => {
                if (!total) {
                    const generator = this._$generator.generator(
                        GeneratorService.accountsStoreEmployeeSchema,
                        5,
                        50
                    );

                    this.store.dispatch(
                        BrandStoreActions.generateStoreEmployeesDemo({ payload: generator })
                    );
                }
            }),
            filter(total => !!total),
            first()
        );
    }
}
