import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
    mainFeatureKey,
    reducers,
    fromStore,
} from './store/reducers';
import { PortfoliosEffects } from './store/effects/portfolios.effects';
import { fromDropdown } from 'app/shared/store/reducers';
import { DropdownEffects } from 'app/shared/store/effects';
import { StoreEffects } from './store/effects/stores.effects';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { ExportsEffects } from 'app/shared/components/exports/store/effects';

@NgModule({
    declarations: [],
    imports: [
        StoreModule.forFeature(mainFeatureKey, reducers),
        StoreModule.forFeature(fromDropdown.FEATURE_KEY, fromDropdown.reducer),
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        EffectsModule.forFeature([
            DropdownEffects,
            ExportsEffects,
            StoreEffects,
            PortfoliosEffects
        ])
    ],
})
export class PortfoliosStoreModule { }
