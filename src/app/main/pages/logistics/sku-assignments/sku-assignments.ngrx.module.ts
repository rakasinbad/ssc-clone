import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { fromSkuAssignments } from './store/reducers';
import { SkuAssignmentsEffects } from './store/effects';

@NgModule({
    imports: [
        StoreModule.forFeature(fromSkuAssignments.FEATURE_KEY, fromSkuAssignments.reducer),
        EffectsModule.forFeature([SkuAssignmentsEffects])
    ]
})
export class SkuAssignmentsNgRxStoreModule {}
