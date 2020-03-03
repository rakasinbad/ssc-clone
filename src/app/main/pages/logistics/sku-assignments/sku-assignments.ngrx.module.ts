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
