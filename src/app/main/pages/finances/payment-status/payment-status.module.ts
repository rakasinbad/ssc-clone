import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { PaymentStatusRoutingModule } from './payment-status-routing.module';
import { PaymentStatusComponent } from './payment-status.component';
import { fromPaymentStatus } from './store/reducers';

/**
 *
 *
 * @export
 * @class PaymentStatusModule
 */
@NgModule({
    declarations: [PaymentStatusComponent],
    imports: [
        PaymentStatusRoutingModule,

        SharedModule,
        MaterialModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromPaymentStatus.FEATURE_KEY, fromPaymentStatus.reducer),
        EffectsModule.forFeature([])
    ]
})
export class PaymentStatusModule {}
