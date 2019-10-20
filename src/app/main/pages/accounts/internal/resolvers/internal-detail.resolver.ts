import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

import { InternalActions } from '../store/actions';
import { fromInternal } from '../store/reducers';
import { InternalSelectors } from '../store/selectors';

@Injectable({
    providedIn: 'root'
})
export class InternalDetailResolver implements Resolve<any> {
    constructor(private store: Store<fromInternal.FeatureState>) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const { id } = route.params;

        if (!id) {
            return of(null);
        }

        return this.store.select(InternalSelectors.getSelectedInternal).pipe(
            tap(internal => {
                if (!internal) {
                    this.store.dispatch(InternalActions.getInternalDemoDetail({ payload: id }));
                }
            }),
            filter(internal => !!internal),
            first()
        );
    }
}
