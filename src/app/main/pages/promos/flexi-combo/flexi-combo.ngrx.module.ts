import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromFlexiComboCore from './store/reducers';
import { FlexiComboEffects } from './store/effects';
import { FlexiComboListEffects } from './store/effects/flexi-combo-list.effects';

@NgModule({
    imports: [
        StoreModule.forFeature(fromFlexiComboCore.featureKey, fromFlexiComboCore.reducers),
        EffectsModule.forFeature([FlexiComboEffects, FlexiComboListEffects])
    ]
})
export class FlexiComboNgRxStoreModule {}
