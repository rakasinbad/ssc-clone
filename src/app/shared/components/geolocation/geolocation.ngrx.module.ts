import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
    GeolocationEffects,
} from './store/effects';
import {
    featureKey as GeolocationCoreFeatureKey,
    reducers as GeolocationCoreReducers
} from './store/reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(GeolocationCoreFeatureKey, GeolocationCoreReducers),
        EffectsModule.forFeature([
            GeolocationEffects,
        ])
    ],
    exports: [
        StoreModule,
        EffectsModule
    ]
})
export class GeolocationNgRxStoreModule {}
