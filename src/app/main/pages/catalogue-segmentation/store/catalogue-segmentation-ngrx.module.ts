import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CreateCatalogueSegmentationEffects, FetchCataloguesEffects, FetchCatalogueSegmentationEffects, FetchCatalogueSegmentationsEffects, UnassignedCatalogueEffects, UpdateCatalogueSegmentationEffects } from './effects';
import { CatalogueSegmentationsEffects } from './effects/catalogue-segmentations.effects';
import { fromCatalogueSegmentation } from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(
            fromCatalogueSegmentation.catalogueSegmentationFeatureKey,
            fromCatalogueSegmentation.reducers
        ),
        EffectsModule.forFeature([
            CatalogueSegmentationsEffects,
            CreateCatalogueSegmentationEffects,
            FetchCataloguesEffects,
            FetchCatalogueSegmentationEffects,
            FetchCatalogueSegmentationsEffects,
            UnassignedCatalogueEffects,
            UpdateCatalogueSegmentationEffects,
        ]),
    ],
})
export class CatalogueSegmentationNgrxModule {}
