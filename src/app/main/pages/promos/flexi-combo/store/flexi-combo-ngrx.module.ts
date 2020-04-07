import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { FlexiComboEffects } from './effects';
import { FlexiComboListEffects } from './effects/flexi-combo-list.effects';
import * as fromFlexiComboCore from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(fromFlexiComboCore.featureKey, fromFlexiComboCore.reducers),
        EffectsModule.forFeature([FlexiComboEffects, FlexiComboListEffects]),
    ],
})
export class FlexiComboNgrxModule {}
