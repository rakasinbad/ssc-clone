import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CatalogueTaxActions } from '../store/actions';
import { fromCatalogueTax } from '../store/reducers';
import { CatalogueTaxSelectors } from '../store/selectors';
import { CatalogueTax } from './../models/classes/catalogue-tax.class';
@Injectable({ providedIn: 'root' })
export class CatalogueTaxFacadeService {
    readonly catalogueTaxes$: Observable<CatalogueTax[]> = this.store.select(
        CatalogueTaxSelectors.selectAll
    );

    readonly isLoading$: Observable<boolean> = this.store.select(
        CatalogueTaxSelectors.selectIsLoading
    );

    readonly isRefresh$: Observable<boolean> = this.store.select(
        CatalogueTaxSelectors.selectIsRefresh
    );

    readonly totalItem$: Observable<number> = this.store.select(
        CatalogueTaxSelectors.selectTotalItem
    );

    constructor(private readonly store: Store<fromCatalogueTax.FeatureState>) {}

    fetchCatalogueTaxes(): void {
        this.store.dispatch(
            CatalogueTaxActions.fetchRequest({
                queryParams: {
                    paginate: true,
                    sort: 'asc',
                    sortBy: 'amount',
                    search: [
                        { fieldName: 'typeAmount', keyword: 'percent' },
                        { fieldName: 'status', keyword: 'active' },
                    ],
                },
            })
        );
    }
}
