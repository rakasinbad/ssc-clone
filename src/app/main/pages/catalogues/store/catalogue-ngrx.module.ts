import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ExportsEffects } from 'app/shared/components/exports/store/effects';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import {
    AdjustPriceSettingEffects,
    BrandEffects,
    CatalogueEffects,
    DeletePriceSegmentationEffects,
    FetchCatalogueTaxesEffects,
    UpdateMaxOrderQtySegmentationEffects,
    MssSettingsEffects,
} from './effects';
import { fromBrand, fromCatalogue, fromCatalogueTax, fromCatalogueMssSettings } from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(fromCatalogue.FEATURE_KEY, fromCatalogue.reducer),
        StoreModule.forFeature(fromBrand.FEATURE_KEY, fromBrand.reducer),
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        StoreModule.forFeature(fromCatalogueTax.catalogueTaxFeatureKey, fromCatalogueTax.reducer),
        StoreModule.forFeature(fromCatalogueMssSettings.FEATURE_KEY, fromCatalogueMssSettings.reducer),

        EffectsModule.forFeature([
            AdjustPriceSettingEffects,
            BrandEffects,
            CatalogueEffects,
            DeletePriceSegmentationEffects,
            ExportsEffects,
            FetchCatalogueTaxesEffects,
            UpdateMaxOrderQtySegmentationEffects,
            MssSettingsEffects,
        ]),
    ],
})
export class CatalogueNgrxModule {}
