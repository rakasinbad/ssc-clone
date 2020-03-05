import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import * as fromRoot from 'app/store/app.reducer';
import { Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class BreadcrumbResolver implements Resolve<any> {
    private _breadcrumbs: IBreadcrumbs[];

    constructor(private store: Store<fromRoot.State>) {
        this._breadcrumbs = [
            {
                title: 'Home',
                translate: 'BREADCRUBMS.HOME'
            },
            {
                title: 'Order Managements',
                translate: 'BREADCRUMBS.ORDER_MANAGEMENTS'
            }
        ];
    }

    resolve(route: ActivatedRouteSnapshot): Observable<any> | Promise<any> | any {
        return this.store.select(UiSelectors.getBreadcrumbs).pipe(
            tap(breadcrumb => {
                if (!breadcrumb) {
                    this.store.dispatch(
                        UiActions.createBreadcrumb({
                            payload: this._breadcrumbs
                        })
                    );
                }
            }),
            filter(breadcrumb => !!breadcrumb),
            first()
        );
    }
}
