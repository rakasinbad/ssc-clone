import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ImportMassUploadEffects } from './effects';
import * as fromImportMassUpload from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromImportMassUpload.featureKey, fromImportMassUpload.reducers),
        EffectsModule.forFeature([
            ImportMassUploadEffects,
        ])
    ],
    exports: [StoreModule, EffectsModule]
})

export class MassUploadStoreModule { }
