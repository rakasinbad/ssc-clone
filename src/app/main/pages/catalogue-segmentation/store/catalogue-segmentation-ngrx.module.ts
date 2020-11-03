import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FetchCatalogueSegmentationsEffects } from './effects';
import { fromCatalogueSegmentation } from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(
            fromCatalogueSegmentation.catalogueSegmentationFeatureKey,
            fromCatalogueSegmentation.reducers
        ),
        EffectsModule.forFeature([FetchCatalogueSegmentationsEffects]),
    ],
})
export class CatalogueSegmentationNgrxModule {}
