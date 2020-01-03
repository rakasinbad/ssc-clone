import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { JourneyPlanEffects } from './store/effects';
import * as fromJourneyPlans from './store/reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromJourneyPlans.featureKey, fromJourneyPlans.reducers),
        EffectsModule.forFeature([JourneyPlanEffects])
    ]
})
export class JourneyPlansStoreModule {}
