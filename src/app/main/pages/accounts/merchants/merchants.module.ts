import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ImportAdvancedModule } from 'app/shared';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { MerchantDetailComponent } from './merchant-detail/merchant-detail.component';
import { MerchantEmployeeDetailComponent } from './merchant-detail/merchant-employee-detail/merchant-employee-detail.component';
import { MerchantInfoDetailComponent } from './merchant-detail/merchant-info-detail/merchant-info-detail.component';
import { MerchantLocationDetailComponent } from './merchant-detail/merchant-location-detail/merchant-location-detail.component';
import { MerchantEmployeeComponent } from './merchant-employee/merchant-employee.component';
import { MerchantFormComponent } from './merchant-form/merchant-form.component';
import { MerchantsRoutingModule } from './merchants-routing.module';
import { MerchantsComponent } from './merchants.component';
import { MerchantEffects } from './store/effects';
import { fromMerchant } from './store/reducers';
import { StoreSettingEffects } from './store/effects/store-setting.effects';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { ExportsEffects } from 'app/shared/components/exports/store/effects';

/**
 *
 *
 * @export
 * @class MerchantsModule
 */
@NgModule({
    declarations: [
        MerchantsComponent,
        MerchantDetailComponent,
        MerchantEmployeeDetailComponent,
        MerchantInfoDetailComponent,
        MerchantLocationDetailComponent,
        MerchantEmployeeComponent,
        MerchantFormComponent,
        // MerchantSettingComponent
    ],
    imports: [
        MerchantsRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        ImportAdvancedModule,

        // AgmCoreModule,
        // LeafletModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromMerchant.FEATURE_KEY, fromMerchant.reducer),
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        EffectsModule.forFeature([ExportsEffects, MerchantEffects, StoreSettingEffects])
    ]
})
export class MerchantsModule {}
