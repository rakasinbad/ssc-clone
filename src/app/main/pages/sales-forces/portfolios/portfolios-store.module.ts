import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
    mainFeatureKey,
    reducers,
} from './store/reducers';
import { PortfoliosEffects } from './store/effects/portfolios.effects';
import { fromDropdown } from 'app/shared/store/reducers';
import { DropdownEffects } from 'app/shared/store/effects';
import { fromMerchant } from '../../accounts/merchants/store/reducers';
import { MerchantEffects } from '../../accounts/merchants/store/effects';

@NgModule({
    declarations: [],
    imports: [
        StoreModule.forFeature(mainFeatureKey, reducers),
        StoreModule.forFeature(fromDropdown.FEATURE_KEY, fromDropdown.reducer),
        StoreModule.forFeature(fromMerchant.FEATURE_KEY, fromMerchant.reducer),
        EffectsModule.forFeature([
            DropdownEffects,
            MerchantEffects,
            PortfoliosEffects
        ])
    ],
})
export class PortfoliosStoreModule { }
