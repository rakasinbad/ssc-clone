import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
    fromExport
} from './store/reducers';

import {
    ExportsEffects
} from './store/effects';

@NgModule({
    declarations: [],
    imports: [
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        EffectsModule.forFeature([
            ExportsEffects,
        ])
    ],
})
export class ExportsStoreModule { }
