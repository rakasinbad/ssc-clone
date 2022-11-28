import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { WarehouseCoveragesStoreModule } from './store';
import { WarehouseCoveragesRoutingModule } from './warehouse-coverages-routing.module';
import { WarehouseCoveragesComponent } from './warehouse-coverages.component';
import { WarehouseCoveragesFormComponent } from './pages/warehouse-coverages-form/warehouse-coverages-form.component';

@NgModule({
    declarations: [
        WarehouseCoveragesComponent,
        WarehouseCoveragesFormComponent,
    ],
    imports: [
        WarehouseCoveragesRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild(),

        // Store
        WarehouseCoveragesStoreModule
    ]
})
export class WarehouseCoveragesModule {}
