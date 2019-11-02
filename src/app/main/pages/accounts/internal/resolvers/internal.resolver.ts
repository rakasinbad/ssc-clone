import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { GeneratorService } from 'app/shared/helpers';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { InternalActions } from '../store/actions';
import { fromInternal } from '../store/reducers';
import { InternalSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class InternalResolver implements Resolve<any> {
    constructor(
        private store: Store<fromInternal.FeatureState>,
        private _$generator: GeneratorService
    ) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        return this.store.select(InternalSelectors.getTotalInternalEmployeeEntity).pipe(
            tap(total => {
                if (!total) {
                    const generator = this._$generator.generator(
                        GeneratorService.accountsInternalSchema,
                        5,
                        10
                    );

                    this.store.dispatch(
                        InternalActions.generateInternalDemo({ payload: generator })
                    );
                }
            }),
            filter(total => !!total),
            first()
        );
    }
}
