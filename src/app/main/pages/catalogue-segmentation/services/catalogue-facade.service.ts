import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { CatalogueSegmentationModule } from '../catalogue-segmentation.module';
import { Catalogue } from '../models';
import { CatalogueActions } from '../store/actions';
import { fromCatalogueSegmentation } from '../store/reducers';
import { DataCatalogueSelectors } from '../store/selectors';

@Injectable({ providedIn: CatalogueSegmentationModule })
export class CatalogueFacadeService {
    readonly catalogue$: Observable<Catalogue> = this.store.select(
        DataCatalogueSelectors.selectCurrentItem
    );
    readonly catalogues$: Observable<Catalogue[]> = this.store.select(
        DataCatalogueSelectors.selectAll
    );
    readonly isLoading$: Observable<boolean> = this.store.select(
        DataCatalogueSelectors.selectIsLoading
    );
    readonly isRefresh$: Observable<boolean> = this.store.select(
        DataCatalogueSelectors.selectIsRefresh
    );
    readonly totalItem$: Observable<number> = this.store.select(
        DataCatalogueSelectors.selectTotalItem
    );

    constructor(private store: Store<fromCatalogueSegmentation.FeatureState>) {}

    getWithQuery(params: IQueryParams): void {
        this.store.dispatch(CatalogueActions.fetchCataloguesRequest({ payload: params }));
    }
}
