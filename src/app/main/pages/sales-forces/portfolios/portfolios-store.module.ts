import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
    mainFeatureKey,
    reducers,
} from './store/reducers';

@NgModule({
    declarations: [],
    imports: [
        StoreModule.forFeature(mainFeatureKey, reducers),
        EffectsModule.forFeature([])
    ],
})
export class PortfoliosStoreModule { }
