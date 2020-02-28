import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromSkuAssignmentsCore from './store/reducers';
import {
    SkuAssignmentsEffects,
    SkuAssignmentsWarehouseEffects,
    SkuAssignmentsSkuEffects
} from './store/effects';
import { fromCatalogue } from '../../catalogues/store/reducers';
import { CatalogueEffects } from '../../catalogues/store/effects';
import * as fromWarehouses from 'app/shared/store/reducers/sources/warehouse';
import { WarehouseEffects } from 'app/shared/store/effects';

@NgModule({
    imports: [
        StoreModule.forFeature(fromWarehouses.featureKey, fromWarehouses.reducers),
        StoreModule.forFeature(fromSkuAssignmentsCore.featureKey, fromSkuAssignmentsCore.reducers),
        StoreModule.forFeature(fromCatalogue.FEATURE_KEY, fromCatalogue.reducer),
        EffectsModule.forFeature([
            SkuAssignmentsEffects,
            SkuAssignmentsWarehouseEffects,
            SkuAssignmentsSkuEffects,
            CatalogueEffects,
            WarehouseEffects
        ])
    ]
})
export class SkuAssignmentsNgRxStoreModule {}
