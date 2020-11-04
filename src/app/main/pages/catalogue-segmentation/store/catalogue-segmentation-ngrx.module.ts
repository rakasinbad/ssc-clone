import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FetchCataloguesEffects, FetchCatalogueSegmentationsEffects } from './effects';
import { fromCatalogueSegmentation } from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(
            fromCatalogueSegmentation.catalogueSegmentationFeatureKey,
            fromCatalogueSegmentation.reducers
        ),
        EffectsModule.forFeature([FetchCatalogueSegmentationsEffects, FetchCataloguesEffects]),
    ],
})
export class CatalogueSegmentationNgrxModule {}
