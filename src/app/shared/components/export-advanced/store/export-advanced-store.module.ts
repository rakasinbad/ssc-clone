import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ExportFilterEffects, ExportHistoryEffects } from './effects';
import { fromExportFilter, fromExportHistory } from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromExportFilter.featureKey, fromExportFilter.reducer),
        StoreModule.forFeature(fromExportHistory.featureKey, fromExportHistory.reducer),
        EffectsModule.forFeature([
            ExportFilterEffects,
            ExportHistoryEffects
        ])
    ],
    exports: [StoreModule, EffectsModule]
})
export class ExportAdvancedStoreModule { }
