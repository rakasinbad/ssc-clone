import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodTargetPromoComponent } from './period-target-promo.component';
import { PeriodTargetPromoRoutingModule } from './period-target-promo.routes';
import { PeriodTargetPromoNgRxStoreModule } from './period-target-promo.ngrx.module';

import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

// Component
import { PeriodTargetPromoListComponent } from './components/list/list.component';
import { PeriodTargetPromoFormComponent } from './pages/form/form.component';
import { PeriodTargetPromoDetailComponent } from './pages/detail/detail.component';
import { PeriodTargetPromoGeneralInformationComponent } from './components/general-information/general-information.component';
import { PeriodTargetPromoTriggerInformationComponent } from './components/trigger-information/trigger-information.component';
import { PeriodTargetPromoCustomerSegmentationSettingsComponent } from './components/customer-segmentation-settings/customer-segmentation-settings.component';
import { PeriodTargetPromoRewardInformationComponent } from './components/reward/reward.component';
import { PeriodTargetPromoTriggerConditionBenefitSettingsComponent } from './components/condition-benefit-settings/condition-benefit-settings.component';

@NgModule({
    declarations: [
        PeriodTargetPromoComponent,
        PeriodTargetPromoListComponent,
        PeriodTargetPromoDetailComponent,
        PeriodTargetPromoFormComponent,
        PeriodTargetPromoGeneralInformationComponent,
        PeriodTargetPromoTriggerInformationComponent,
        PeriodTargetPromoCustomerSegmentationSettingsComponent,
        PeriodTargetPromoRewardInformationComponent,
        PeriodTargetPromoTriggerConditionBenefitSettingsComponent,
    ],
    imports: [
        CommonModule,
        PeriodTargetPromoRoutingModule,
        PeriodTargetPromoNgRxStoreModule,

        SharedModule,
        MaterialModule,
        SharedComponentsModule,

        RxReactiveFormsModule,
        NgxPermissionsModule.forChild()
    ]
})
export class PeriodTargetPromoModule {}