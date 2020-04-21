import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoucherComponent } from './voucher.component';
import { VoucherRoutingModule } from './voucher.routes';
import { VoucherNgRxStoreModule } from './voucher.ngrx.module';

import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

// Component
import { VoucherListComponent } from './components/list/list.component';
import { VoucherFormComponent } from './pages/form/form.component';
import { VoucherDetailComponent } from './pages/detail/detail.component';
import { VoucherGeneralInformationComponent } from './components/general-information/general-information.component';
import { VoucherTriggerInformationComponent } from './components/trigger-information/trigger-information.component';
import { VoucherCustomerSegmentationSettingsComponent } from './components/customer-segmentation-settings/customer-segmentation-settings.component';
import { VoucherBenefitInformationComponent } from './components/benefit/benefit.component';
import { VoucherTriggerConditionBenefitSettingsComponent } from './components/condition-benefit-settings/condition-benefit-settings.component';

@NgModule({
    declarations: [
        VoucherComponent,
        VoucherListComponent,
        VoucherDetailComponent,
        VoucherFormComponent,
        VoucherGeneralInformationComponent,
        VoucherTriggerInformationComponent,
        VoucherCustomerSegmentationSettingsComponent,
        VoucherBenefitInformationComponent,
        VoucherTriggerConditionBenefitSettingsComponent,
    ],
    imports: [
        CommonModule,
        VoucherRoutingModule,
        VoucherNgRxStoreModule,

        SharedModule,
        MaterialModule,
        SharedComponentsModule,

        RxReactiveFormsModule,
        NgxPermissionsModule.forChild(),
    ],
})
export class VoucherModule {}
