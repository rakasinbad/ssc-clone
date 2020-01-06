import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { SalesRepDetailInfoComponent } from './sales-rep-detail/sales-rep-detail-info/sales-rep-detail-info.component';
import { SalesRepDetailPasswordComponent } from './sales-rep-detail/sales-rep-detail-password/sales-rep-detail-password.component';
import { SalesRepDetailComponent } from './sales-rep-detail/sales-rep-detail.component';
import {
    SalesRepFormComponent,
    SalesRepInfoComponent,
    SalesRepPasswordComponent
} from './sales-rep-form';
import { SalesRepsRoutingModule } from './sales-reps-routing.module';
import { SalesRepsStoreModule } from './sales-reps-store.module';
import { SalesRepsComponent } from './sales-reps.component';

/**
 *
 *
 * @export
 * @class SalesRepsModule
 */
@NgModule({
    declarations: [
        SalesRepsComponent,
        SalesRepFormComponent,
        SalesRepInfoComponent,
        SalesRepPasswordComponent,
        SalesRepDetailComponent,
        SalesRepDetailInfoComponent,
        SalesRepDetailPasswordComponent
    ],
    imports: [
        SalesRepsRoutingModule,

        SharedModule,
        MaterialModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild(),

        // Store
        SalesRepsStoreModule
    ]
})
export class SalesRepsModule {}
