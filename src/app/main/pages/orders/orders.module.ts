import { NgModule } from '@angular/core';
import { FuseNavigationModule } from '@fuse/components';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
// import { NavbarModule } from 'app/layout/components/navbar/navbar.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [OrdersComponent],
    imports: [
        OrdersRoutingModule,

        TranslateModule,
        SharedModule,
        MaterialModule,
        FuseNavigationModule,
        // NavbarModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild()
    ]
})
export class OrdersModule {}
