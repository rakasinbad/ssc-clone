import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { PromoHierarchyEffects } from './effects';
import * as fromPromoHierarchyCore from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(fromPromoHierarchyCore.featureKey, fromPromoHierarchyCore.reducers),
        EffectsModule.forFeature([PromoHierarchyEffects]),
    ],
})
export class PromoHierarchyNgrxModule {}
