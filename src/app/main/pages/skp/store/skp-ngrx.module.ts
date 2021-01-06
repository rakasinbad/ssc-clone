import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SkpEffects } from './effects';
import * as fromSkpCore from './reducers';

@NgModule({
    imports: [
        StoreModule.forFeature(fromSkpCore.featureKey, fromSkpCore.reducers),
        EffectsModule.forFeature([SkpEffects]),
    ],
})
export class SkpNgrxModule {}
