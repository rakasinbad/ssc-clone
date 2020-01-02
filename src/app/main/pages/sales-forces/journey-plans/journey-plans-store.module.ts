import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import * as fromJourneyPlans from './store/reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromJourneyPlans.featureKey, fromJourneyPlans.reducers),
        EffectsModule.forFeature([])
    ]
})
export class JourneyPlansStoreModule {}
