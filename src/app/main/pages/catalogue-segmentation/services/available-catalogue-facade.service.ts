import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormMode } from 'app/shared/models';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';
import { AvailableCatalogue } from '../models';
import { AvailableCatalogueActions } from '../store/actions';
import { fromCatalogueSegmentation } from '../store/reducers';
import { DataAvailableCatalogueSelectors } from '../store/selectors';

@Injectable({ providedIn: 'root' })
export class AvailableCatalogueFacadeService {
    readonly catalogue$: Observable<AvailableCatalogue> = this.store.select(
        DataAvailableCatalogueSelectors.selectCurrentItem
    );
    readonly catalogues$: Observable<AvailableCatalogue[]> = this.store.select(
        DataAvailableCatalogueSelectors.selectAll
    );
    readonly isLoading$: Observable<boolean> = this.store.select(
        DataAvailableCatalogueSelectors.selectIsLoading
    );
    readonly isRefresh$: Observable<boolean> = this.store.select(
        DataAvailableCatalogueSelectors.selectIsRefresh
    );
    readonly totalItem$: Observable<number> = this.store.select(
        DataAvailableCatalogueSelectors.selectTotalItem
    );

    constructor(private store: Store<fromCatalogueSegmentation.FeatureState>) {}

    getWithQuery(params: IQueryParams, formMode: FormMode = 'add', id?: string): void {
        this.store.dispatch(
            AvailableCatalogueActions.fetchAvailableCataloguesRequest({
                payload: { params, formMode, id },
            })
        );
    }

    resetState(): void {
        this.store.dispatch(AvailableCatalogueActions.resetState());
    }
}
