import { NgModule } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { MerchantDetailComponent } from './merchant-detail/merchant-detail.component';
import { MerchantEmployeeDetailComponent } from './merchant-detail/merchant-employee-detail/merchant-employee-detail.component';
import { MerchantInfoDetailComponent } from './merchant-detail/merchant-info-detail/merchant-info-detail.component';
import { MerchantLocationDetailComponent } from './merchant-detail/merchant-location-detail/merchant-location-detail.component';
import { MerchantEmployeeComponent } from './merchant-employee/merchant-employee.component';
import { MerchantFormComponent } from './merchant-form/merchant-form.component';
import { MerchantSettingComponent } from './merchant-setting/merchant-setting.component';
import { MerchantsRoutingModule } from './merchants-routing.module';
import { MerchantsComponent } from './merchants.component';
import { MerchantEffects } from './store/effects';
import { fromMerchant } from './store/reducers';

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
        MerchantSettingComponent
    ],
    imports: [
        MerchantsRoutingModule,

        SharedModule,
        MaterialModule,

        // AgmCoreModule,
        // LeafletModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromMerchant.FEATURE_KEY, fromMerchant.reducer),
        EffectsModule.forFeature([MerchantEffects])
    ]
})
export class MerchantsModule {}
