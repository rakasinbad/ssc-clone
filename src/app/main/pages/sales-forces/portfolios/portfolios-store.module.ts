import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ExportsEffects } from 'app/shared/components/exports/store/effects';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { fromDropdown } from 'app/shared/store/reducers';

import { PortfoliosEffects } from './store/effects/portfolios.effects';
import { StoreEffects } from './store/effects/stores.effects';
import { mainFeatureKey, reducers } from './store/reducers';

@NgModule({
    declarations: [],
    imports: [
        StoreModule.forFeature(mainFeatureKey, reducers),
        StoreModule.forFeature(fromDropdown.FEATURE_KEY, fromDropdown.reducer),
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        EffectsModule.forFeature([ExportsEffects, StoreEffects, PortfoliosEffects])
    ]
})
export class PortfoliosStoreModule {}
