import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import * as fromWarehouseCoverages from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromWarehouseCoverages.featureKey, fromWarehouseCoverages.reducers),
        EffectsModule.forFeature([])
    ]
})
export class WarehouseCoveragesStoreModule {}
