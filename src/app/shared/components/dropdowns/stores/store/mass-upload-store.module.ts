import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ImportMassUploadEffects } from './effects';
import { fromImportMassUpload } from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromImportMassUpload.featureKey, fromImportMassUpload.reducer),
        EffectsModule.forFeature([
            ImportMassUploadEffects,
        ])
    ],
    exports: [StoreModule, EffectsModule]
})

export class MassUploadStoreModule { }
