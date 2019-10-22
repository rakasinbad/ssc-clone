import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { IBreadcrumbs } from 'app/shared/models';
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
                title: 'Catalogue',
                translate: 'BREADCRUMBS.CATALOGUE'
            },
            {
                title: 'Manage Product',
                translate: 'BREADCRUMBS.MANAGE_PRODUCT'
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
