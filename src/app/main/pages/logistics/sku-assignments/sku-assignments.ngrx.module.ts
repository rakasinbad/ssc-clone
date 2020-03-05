import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromSkuAssignmentsCore from './store/reducers';
import {
    SkuAssignmentsEffects,
} from './store/effects';
import { fromCatalogue } from '../../catalogues/store/reducers';
import { CatalogueEffects } from '../../catalogues/store/effects';
import { SkuAssignmentsWarehouseEffects } from './store/effects/sku-assignments-warehouse.effects';
import { SkuAssignmentsSkuEffects } from './store/effects/sku-assignments-sku.effects';

@NgModule({
    imports: [
        StoreModule.forFeature(fromSkuAssignmentsCore.featureKey, fromSkuAssignmentsCore.reducers),
        StoreModule.forFeature(fromCatalogue.FEATURE_KEY, fromCatalogue.reducer),
        EffectsModule.forFeature([
            SkuAssignmentsEffects,
            SkuAssignmentsWarehouseEffects,
            SkuAssignmentsSkuEffects,
            CatalogueEffects,
        ])
    ]
})
export class SkuAssignmentsNgRxStoreModule {}
