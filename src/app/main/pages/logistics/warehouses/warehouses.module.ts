import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { WarehousesStoreModule } from './store';
import {
    WarehouseDetailCoverageComponent,
    WarehouseDetailGeneralComponent,
    WarehouseDetailLocationComponent
} from './warehouse-detail';
import { WarehouseDetailComponent } from './warehouse-detail/warehouse-detail.component';
import { WarehouseFormComponent } from './warehouse-form';
import { WarehousesRoutingModule } from './warehouses-routing.module';
import { WarehousesComponent } from './warehouses.component';

@NgModule({
    declarations: [
        WarehousesComponent,
        WarehouseFormComponent,
        WarehouseDetailComponent,
        WarehouseDetailGeneralComponent,
        WarehouseDetailLocationComponent,
        WarehouseDetailCoverageComponent
    ],
    imports: [
        WarehousesRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild(),

        // Store
        WarehousesStoreModule
    ]
})
export class WarehousesModule {}
