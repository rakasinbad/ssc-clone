import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import {
    StoreChannelEffects,
    StoreClusterEffects,
    StoreGroupEffects,
    StoreSegmentAlertEffects,
    StoreTypeEffects
} from './effects';
import * as fromMerchantSegments from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromMerchantSegments.featureKey, fromMerchantSegments.reducers),
        EffectsModule.forFeature([
            StoreChannelEffects,
            StoreClusterEffects,
            StoreGroupEffects,
            StoreSegmentAlertEffects,
            StoreTypeEffects
        ])
    ]
})
export class MerchantSegmentationNgrxModule {}
