import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { MerchantSegmentationAlertComponent } from './merchant-segmentation-alert';
import { MerchantSegmentationFormComponent } from './merchant-segmentation-form';
import { MerchantSegmentationComponent } from './merchant-segmentation.component';
import { MerchantSegmentationRoutingModule } from './merchant-segmentation.routes';
import { MerchantSegmentationNgrxModule } from './store';
import { StoreChannelSegmentationComponent } from './store-channel-segmentation';
import { StoreClusterSegmentationComponent } from './store-cluster-segmentation';
import { StoreGroupSegmentationComponent } from './store-group-segmentation';
import { StoreTypeSegmentationComponent } from './store-type-segmentation';

@NgModule({
    declarations: [
        MerchantSegmentationAlertComponent,
        MerchantSegmentationComponent,
        MerchantSegmentationFormComponent,
        StoreChannelSegmentationComponent,
        StoreClusterSegmentationComponent,
        StoreGroupSegmentationComponent,
        StoreTypeSegmentationComponent
    ],
    imports: [
        MerchantSegmentationRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild(),

        // Ngrx Store
        MerchantSegmentationNgrxModule
    ],
    entryComponents: [MerchantSegmentationFormComponent, MerchantSegmentationAlertComponent]
})
export class MerchantSegmentationModule {}
