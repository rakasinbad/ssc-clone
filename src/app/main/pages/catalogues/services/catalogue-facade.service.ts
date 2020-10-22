import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { CataloguesModule } from '../catalogues.module';
import { fromCatalogue } from '../store/reducers';

@Injectable({ providedIn: CataloguesModule })
export class CatalogueFacadeService {
    constructor(private store: Store<fromCatalogue.FeatureState>) {}

    createBreadcrumb(breadcrumbs: IBreadcrumbs[]): void {
        this.store.dispatch(UiActions.createBreadcrumb({ payload: breadcrumbs }));
    }
}
