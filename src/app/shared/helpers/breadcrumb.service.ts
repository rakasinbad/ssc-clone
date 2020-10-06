import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IBreadcrumbs } from '../models/global.model';
import { UiActions } from '../store/actions';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
    private _breadcrumbs: IBreadcrumbs[];

    constructor(private store: Store<any>) {
        this.breadcrumbs = [];
    }

    createBreadcrumb(breadcrumbs: IBreadcrumbs[]): void {
        this.store.dispatch(UiActions.createBreadcrumb({ payload: breadcrumbs }));
    }

    set breadcrumbs(value: IBreadcrumbs[]) {
        this._breadcrumbs = value;
    }

    get breadcrumbs(): IBreadcrumbs[] {
        return this._breadcrumbs;
    }
}
