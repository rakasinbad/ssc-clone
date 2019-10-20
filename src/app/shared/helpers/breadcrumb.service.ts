import { Injectable } from '@angular/core';
import { IBreadcrumbs } from '../models';

@Injectable({
    providedIn: 'root'
})
export class BreadcrumbService {
    private _breadcrumbs: IBreadcrumbs[];

    constructor() {
        this.breadcrumbs = [];
    }

    set breadcrumbs(value: IBreadcrumbs[]) {
        this._breadcrumbs = value;
    }

    get breadcrumbs(): IBreadcrumbs[] {
        return this._breadcrumbs;
    }
}
