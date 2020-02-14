import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ImportAdvancedEffects, ImportHistoryEffects, TemplateHistoryEffects } from './effects';
import { fromImportAdvanced } from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromImportAdvanced.featureKey, fromImportAdvanced.reducer),
        EffectsModule.forFeature([
            ImportAdvancedEffects,
            ImportHistoryEffects,
            TemplateHistoryEffects
        ])
    ],
    exports: [StoreModule, EffectsModule]
})
export class ImportAdvancedStoreModule {}
