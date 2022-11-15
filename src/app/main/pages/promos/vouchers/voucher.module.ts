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
import { VoucherConditionSettingsComponent } from './components/condition-settings/condition-settings.component';
import { VoucherEligibleProductSettingsComponent } from './components/eligible-product-settings/eligible-product-settings.component';
import { VoucherBenefitInformationComponent } from './components/benefit/benefit.component';
import { VoucherEligibleStoreSettingsComponent } from './components/eligible-store-settings/eligible-store-settings.component';
import { LayerSettingsComponent } from './components/layer-settings/layer-settings.component';

@NgModule({
    declarations: [
        VoucherComponent,
        VoucherListComponent,
        VoucherDetailComponent,
        VoucherFormComponent,
        VoucherGeneralInformationComponent,
        VoucherConditionSettingsComponent,
        VoucherEligibleStoreSettingsComponent,
        VoucherBenefitInformationComponent,
        VoucherEligibleProductSettingsComponent,
        LayerSettingsComponent,
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
