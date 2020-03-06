import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { 
    featureKey as WarehouseCoveragesFeatureKey,
    reducers as WarehouseCoverageReducers
} from './reducers';
import { WarehouseCoverageEffects } from './effects/warehouse-coverage.effects';
import { LocationEffects } from './effects';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(WarehouseCoveragesFeatureKey, WarehouseCoverageReducers),
        EffectsModule.forFeature([
            WarehouseCoverageEffects,
            LocationEffects,
        ])
    ]
})
export class WarehouseCoveragesStoreModule {}
