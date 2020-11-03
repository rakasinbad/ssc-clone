import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CataloguesModule } from '../catalogues.module';
import { fromBrand } from '../store/reducers';
import { BrandSelectors } from '../store/selectors';

@Injectable({ providedIn: CataloguesModule })
export class BrandFacadeService {
    isLoading$: Observable<boolean> = this.store.select(BrandSelectors.getIsLoading);

    constructor(private store: Store<fromBrand.FeatureState>) {}
}
