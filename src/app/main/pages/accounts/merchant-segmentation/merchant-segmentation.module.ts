import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { StoreTypeSegmentationComponent } from './';
import { MerchantSegmentationComponent } from './merchant-segmentation.component';
import { MerchantSegmentationRoutingModule } from './merchant-segmentation.routes';

@NgModule({
    declarations: [MerchantSegmentationComponent, StoreTypeSegmentationComponent],
    imports: [
        MerchantSegmentationRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild()
    ]
})
export class MerchantSegmentationModule {}
