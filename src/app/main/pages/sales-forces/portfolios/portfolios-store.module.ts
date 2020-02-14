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

@NgModule({
    declarations: [],
    imports: [
        StoreModule.forFeature(mainFeatureKey, reducers),
        StoreModule.forFeature(fromDropdown.FEATURE_KEY, fromDropdown.reducer),
        EffectsModule.forFeature([
            DropdownEffects,
            StoreEffects,
            PortfoliosEffects
        ])
    ],
})
export class PortfoliosStoreModule { }
