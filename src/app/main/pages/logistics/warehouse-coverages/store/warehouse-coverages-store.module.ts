import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { 
    featureKey as WarehouseCoveragesFeatureKey,
    reducers as WarehouseCoverageReducers
} from './reducers';
import { WarehouseCoverageEffects } from './effects/warehouse-coverage.effects';
import { WarehouseUrbanEffects } from './effects/warehouse-urban.effects';
import { LocationEffects } from './effects';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(WarehouseCoveragesFeatureKey, WarehouseCoverageReducers),
        EffectsModule.forFeature([
            WarehouseCoverageEffects,
            WarehouseUrbanEffects,
            LocationEffects,
        ])
    ]
})
export class WarehouseCoveragesStoreModule {}
