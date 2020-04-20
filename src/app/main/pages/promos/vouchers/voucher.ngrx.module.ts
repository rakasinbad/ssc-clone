import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromVoucherCore from './store/reducers';
import { VoucherEffects } from './store/effects';

@NgModule({
    imports: [
        StoreModule.forFeature(fromVoucherCore.featureKey, fromVoucherCore.reducers),
        EffectsModule.forFeature([VoucherEffects]),
    ],
})
export class VoucherNgRxStoreModule {}
