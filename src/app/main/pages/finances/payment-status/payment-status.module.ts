import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ImportAdvancedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPermissionsModule } from 'ngx-permissions';

import { PaymentStatusFormComponent } from './payment-status-form/payment-status-form.component';
import { PaymentStatusRoutingModule } from './payment-status-routing.module';
import { PaymentStatusComponent } from './payment-status.component';
import { ProofOfPaymentFormComponent } from './proof-of-payment-form/proof-of-payment-form.component';
import { PaymentEffects } from './store/effects';
import { fromPaymentStatus } from './store/reducers';

/**
 *
 *
 * @export
 * @class PaymentStatusModule
 */
@NgModule({
    declarations: [PaymentStatusComponent, PaymentStatusFormComponent, ProofOfPaymentFormComponent],
    imports: [
        PaymentStatusRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxImageZoomModule.forRoot(),
        NgxPermissionsModule.forChild(),

        ImportAdvancedModule,

        StoreModule.forFeature(fromPaymentStatus.FEATURE_KEY, fromPaymentStatus.reducer),
        EffectsModule.forFeature([PaymentEffects])
    ],
    entryComponents: [PaymentStatusFormComponent, ProofOfPaymentFormComponent]
})
export class PaymentStatusModule {}
