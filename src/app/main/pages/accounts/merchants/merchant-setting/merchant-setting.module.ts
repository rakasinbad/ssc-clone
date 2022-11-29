import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { MerchantEffects } from '../store/effects';
import { StoreSettingEffects } from '../store/effects/store-setting.effects';
import { fromMerchant } from '../store/reducers';
import { MerchantSettingStoreIdGenerationComponent } from './components/store-id-generation/store-id-generation.component';
import { MerchantSettingComponent } from './merchant-setting.component';
import { MerchantSettingRoutes } from './merchant-setting.routes';

/**
 *
 *
 * @export
 * @class MerchantsModule
 */
@NgModule({
    declarations: [
        // MerchantsComponent,
        // MerchantDetailComponent,
        // MerchantEmployeeDetailComponent,
        // MerchantInfoDetailComponent,
        // MerchantLocationDetailComponent,
        // MerchantEmployeeComponent,
        // MerchantFormComponent,
        MerchantSettingComponent,
        MerchantSettingStoreIdGenerationComponent
    ],
    imports: [
        MerchantSettingRoutes,

        SharedModule,
        MaterialModule,

        // AgmCoreModule,
        // LeafletModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromMerchant.FEATURE_KEY, fromMerchant.reducer),
        EffectsModule.forFeature([MerchantEffects, StoreSettingEffects])
    ],
    entryComponents: [MerchantSettingStoreIdGenerationComponent]
})
export class MerchantSettingModule {}
