import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromSkuAssignmentsCore from './store/reducers';
import {
    SkuAssignmentsEffects,
} from './store/effects';
import { SkuAssignmentsWarehouseEffects } from './store/effects/sku-assignments-warehouse.effects';
import { SkuAssignmentsSkuEffects } from './store/effects/sku-assignments-sku.effects';
import { WarehouseCatalogueEffects } from './store/effects/warehouse-catalogue.effects';

@NgModule({
    imports: [
        StoreModule.forFeature(fromSkuAssignmentsCore.featureKey, fromSkuAssignmentsCore.reducers),
        EffectsModule.forFeature([
            SkuAssignmentsEffects,
            SkuAssignmentsWarehouseEffects,
            SkuAssignmentsSkuEffects,
            WarehouseCatalogueEffects,
        ])
    ]
})
export class SkuAssignmentsNgRxStoreModule {}
