import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromRoot from 'app/store/app.reducer';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { DropdownActions } from '../store/actions';
import { DropdownSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class DropdownRolesResolver implements Resolve<any> {
    constructor(private store: Store<fromRoot.State>) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return this.store.select(DropdownSelectors.getRoleDropdownState).pipe(
            tap(total => {
                if (!total.length) {
                    this.store.dispatch(DropdownActions.fetchDropdownRoleRequest());
                }
            }),
            filter(total => !!total.length),
            first()
        );
    }
}
