import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { CrossSellingPromoEffects } from './effects';
import * as fromCrossSellingPromoCore from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(fromCrossSellingPromoCore.featureKey, fromCrossSellingPromoCore.reducers),
        EffectsModule.forFeature([CrossSellingPromoEffects]),
    ],
})
export class CrossSellingPromoNgrxModule {}
