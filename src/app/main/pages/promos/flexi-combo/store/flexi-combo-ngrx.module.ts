import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { FlexiComboEffects } from './effects';
import * as fromFlexiComboCore from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(fromFlexiComboCore.featureKey, fromFlexiComboCore.reducers),
        EffectsModule.forFeature([FlexiComboEffects]),
    ],
})
export class FlexiComboNgrxModule {}
