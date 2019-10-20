import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { GeneratorService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { StoreActions } from '../store/actions';
import { fromMerchant } from '../store/reducers';
import { MerchantSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class MerchantResolver implements Resolve<any> {
    constructor(
        private store: Store<fromMerchant.FeatureState>,
        private _$generator: GeneratorService
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        return this.store.select(MerchantSelectors.getTotalStoreEntity).pipe(
            tap(total => {
                if (!total) {
                    const generator = this._$generator.generator(
                        GeneratorService.accountsStoreSchema,
                        5,
                        50
                    );

                    this.store.dispatch(StoreActions.generateStoresDemo({ payload: generator }));
                }
            }),
            filter(total => !!total),
            first()
        );
    }
}
