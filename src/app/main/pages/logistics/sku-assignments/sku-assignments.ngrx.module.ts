import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { fromSkuAssignments } from './store/reducers';
import { SkuAssignmentsEffects } from './store/effects';
import { fromCatalogue } from '../../catalogues/store/reducers';
import { CatalogueEffects } from '../../catalogues/store/effects';
import * as fromWarehouses from 'app/shared/store/reducers/sources/warehouse';
import { WarehouseEffects } from 'app/shared/store/effects';

@NgModule({
    imports: [
        StoreModule.forFeature(fromWarehouses.featureKey, fromWarehouses.reducers),
        StoreModule.forFeature(fromSkuAssignments.FEATURE_KEY, fromSkuAssignments.reducer),
        StoreModule.forFeature(fromCatalogue.FEATURE_KEY, fromCatalogue.reducer),
        EffectsModule.forFeature([SkuAssignmentsEffects, CatalogueEffects, WarehouseEffects])
    ]
})
export class SkuAssignmentsNgRxStoreModule {}
