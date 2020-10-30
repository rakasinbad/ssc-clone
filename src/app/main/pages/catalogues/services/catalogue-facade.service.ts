import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { Observable } from 'rxjs';
import { CataloguesModule } from '../catalogues.module';
import { Catalogue } from '../models';
import { fromCatalogue } from '../store/reducers';
import { CatalogueSelectors } from '../store/selectors';

@Injectable({ providedIn: CataloguesModule })
export class CatalogueFacadeService {
    catalogue$: Observable<Catalogue> = this.store.select(
        CatalogueSelectors.getSelectedCatalogueEntity
    );
    totalCatalogueSegmentation$: Observable<number> = this.store.select(
        CatalogueSelectors.getTotalCataloguePriceSettings
    );
    isLoading$: Observable<boolean> = this.store.select(CatalogueSelectors.getIsLoading);

    constructor(private store: Store<fromCatalogue.FeatureState>) {}

    createBreadcrumb(breadcrumbs: IBreadcrumbs[]): void {
        this.store.dispatch(UiActions.createBreadcrumb({ payload: breadcrumbs }));
    }
}
