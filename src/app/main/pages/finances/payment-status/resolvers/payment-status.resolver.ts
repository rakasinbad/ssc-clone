import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { fromPaymentStatus } from '../store/reducers';

@Injectable({
    providedIn: 'root'
})
export class PaymentStatusResolver implements Resolve<any> {
    constructor(private store: Store<fromPaymentStatus.FeatureState>) {}

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        return this.store.select(UiSelectors.getIsShowCustomToolbar).pipe(
            tap(isShow => {
                if (!isShow) {
                    this.store.dispatch(UiActions.showCustomToolbar());
                }
            }),
            filter(isShow => isShow),
            first()
        );
    }
}
