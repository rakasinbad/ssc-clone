import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import {CollectionEffects} from './effects';
import * as fromCollections from './reducers';

@NgModule({
    imports: [
        // Third Party (Ngrx: https://ngrx.io)
        StoreModule.forFeature(fromCollections.featureKey, fromCollections.reducers),
        EffectsModule.forFeature([
            CollectionEffects
        ])
    ]
})
export class CollectionNgrxModule {}
