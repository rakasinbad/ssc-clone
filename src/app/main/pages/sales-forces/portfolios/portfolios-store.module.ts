import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
    mainFeatureKey,
    reducers,
} from './store/reducers';
import { PortfoliosEffects } from './store/effects/portfolios.effects';

@NgModule({
    declarations: [],
    imports: [
        StoreModule.forFeature(mainFeatureKey, reducers),
        EffectsModule.forFeature([
            PortfoliosEffects
        ])
    ],
})
export class PortfoliosStoreModule { }
