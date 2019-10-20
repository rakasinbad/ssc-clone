import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';

import * as AccountActions from '../store/actions/account.actions';
import * as fromAccount from '../store/reducers/account.reducer';

@Injectable({
    providedIn: 'root'
})
export class AccountDetailResolver implements Resolve<any> {
    constructor(private store: Store<fromAccount.FeatureState>) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const { id } = route.params;

        if (!id) {
            return of(null);
        }

        return of(
            this.store.dispatch(
                AccountActions.fetchAccountRequest({
                    payload: id
                })
            )
        );
    }
}
