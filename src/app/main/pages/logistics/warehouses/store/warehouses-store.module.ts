import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { WarehouseCoverageEffects, WarehouseEffects, WarehouseSkuStockEffects } from './effects';
import * as fromWarehouses from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromWarehouses.featureKey, fromWarehouses.reducers),
        EffectsModule.forFeature([
            WarehouseEffects,
            WarehouseCoverageEffects,
            WarehouseSkuStockEffects
        ])
    ]
})
export class WarehousesStoreModule {}
