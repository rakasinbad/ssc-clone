import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import * as fromStockManagements from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromStockManagements.featureKey, fromStockManagements.reducers),
        EffectsModule.forFeature([])
    ]
})
export class StockManagementsStoreModule {}