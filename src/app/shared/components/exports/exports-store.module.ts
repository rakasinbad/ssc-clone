import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ExportsEffects } from './store/effects';
import { fromExport } from './store/reducers';

@NgModule({
    declarations: [],
    imports: [
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        EffectsModule.forFeature([ExportsEffects])
    ]
})
export class ExportsStoreModule {}
