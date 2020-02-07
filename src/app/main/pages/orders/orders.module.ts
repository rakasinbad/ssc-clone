import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { QuillModule } from 'ngx-quill';

import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderQtyFormComponent } from './order-qty-form/order-qty-form.component';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { OrderEffects } from './store/effects';
import { fromOrder } from './store/reducers';

/**
 *
 *
 * @export
 * @class OrdersModule
 */
@NgModule({
    declarations: [OrdersComponent, OrderDetailComponent, OrderQtyFormComponent],
    imports: [
        OrdersRoutingModule,

        SharedModule,
        MaterialModule,

        QuillModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromOrder.FEATURE_KEY, fromOrder.reducer),
        EffectsModule.forFeature([OrderEffects])
    ],
    entryComponents: [OrderQtyFormComponent]
})
export class OrdersModule {}
