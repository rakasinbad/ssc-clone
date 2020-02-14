import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { JourneyPlanEffects, JourneyPlanStoreEffects } from './store/effects';
import * as fromJourneyPlans from './store/reducers';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { ExportsEffects } from 'app/shared/components/exports/store/effects';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromJourneyPlans.featureKey, fromJourneyPlans.reducers),
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        EffectsModule.forFeature([ExportsEffects, JourneyPlanEffects, JourneyPlanStoreEffects])
    ]
})
export class JourneyPlansStoreModule {}
