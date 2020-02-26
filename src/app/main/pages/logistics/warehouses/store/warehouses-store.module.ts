import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { WarehouseEffects } from './effects';
import * as fromWarehouses from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromWarehouses.featureKey, fromWarehouses.reducers),
        EffectsModule.forFeature([WarehouseEffects])
    ]
})
export class WarehousesStoreModule {}
