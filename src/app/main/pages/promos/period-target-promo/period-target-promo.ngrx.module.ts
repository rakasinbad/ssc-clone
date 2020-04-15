import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromPeriodTargetPromoCore from './store/reducers';
import { PeriodTargetPromoEffects } from './store/effects';

@NgModule({
    imports: [
        StoreModule.forFeature(fromPeriodTargetPromoCore.featureKey, fromPeriodTargetPromoCore.reducers),
        EffectsModule.forFeature([PeriodTargetPromoEffects])
    ]
})
export class PeriodTargetPromoNgRxStoreModule {}
