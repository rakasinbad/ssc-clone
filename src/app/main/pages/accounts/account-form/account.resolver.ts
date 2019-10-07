import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { DropdownActions } from 'app/shared/store/actions';
import { Observable, of } from 'rxjs';

import { AccountActions } from '../store/actions';
import * as fromAccount from '../store/reducers/account.reducer';

@Injectable({ providedIn: 'root' })
export class AccountResolver implements Resolve<any> {
    constructor(private store: Store<fromAccount.FeatureState>) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const { id } = route.params;

        if (!id) {
            return of(null);
        }

        this.store.dispatch(DropdownActions.fetchDropdownRoleRequest());

        if (id === 'new') {
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
