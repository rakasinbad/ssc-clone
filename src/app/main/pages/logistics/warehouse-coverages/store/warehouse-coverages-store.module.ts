import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import * as fromWarehouseCoverages from './reducers';
import { WarehouseCoverageEffects } from './effects/warehouse-coverage.effects';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromWarehouseCoverages.featureKey, fromWarehouseCoverages.reducers),
        EffectsModule.forFeature([
            WarehouseCoverageEffects,
        ])
    ]
})
export class WarehouseCoveragesStoreModule {}
