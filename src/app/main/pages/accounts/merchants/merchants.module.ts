import { AgmCoreModule } from '@agm/core';
import { NgModule } from '@angular/core';
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
import { MerchantsRoutingModule } from './merchants-routing.module';
import { MerchantsComponent } from './merchants.component';
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
        MerchantFormComponent
    ],
    imports: [
        MerchantsRoutingModule,

        SharedModule,
        MaterialModule,

        AgmCoreModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromMerchant.FEATURE_KEY, fromMerchant.reducer),
        EffectsModule.forFeature([])
    ]
})
export class MerchantsModule {}
