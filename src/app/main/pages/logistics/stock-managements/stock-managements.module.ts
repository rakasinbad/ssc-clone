import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule, SharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { StockManagementsStoreModule } from './store';
import {
    StockManagementDetailGeneralComponent,
    StockManagementDetailHistoryComponent
} from './stock-management-detail';
import { StockManagementDetailComponent } from './stock-management-detail/stock-management-detail.component';
import { StockManagementFormComponent } from './stock-management-form';
import { StockManagementsRoutingModule } from './stock-managements-routing.module';
import { StockManagementsComponent } from './stock-managements.component';

@NgModule({
    declarations: [
        StockManagementsComponent,
        StockManagementFormComponent,
        StockManagementDetailComponent,
        StockManagementDetailGeneralComponent,
        StockManagementDetailHistoryComponent
    ],
    imports: [
        StockManagementsRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild(),

        // Store
        StockManagementsStoreModule
    ]
})
export class StockManagementsModule {}
