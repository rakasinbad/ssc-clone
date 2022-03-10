import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ImportAdvancedModule } from 'app/shared';
import { ExportsEffects } from 'app/shared/components/exports/store/effects';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { CalculateGrossPricePipe, CatalogueTypePipe, OrderLogPipe, OrderStatusPipe } from 'app/shared/pipes';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { QuillModule } from 'ngx-quill';
import {
    DeliveryStatusInfoComponent,
    DocumentOrderInfoComponent,
    OmsOrderLineComponent,
    OrderDetailComponent,
    OrderStatusInfoComponent,
    OrderAddComponent,
    OrderStoreShipmentComponent,
    OrderListComponent,
} from './components';
import { OrderQtyFormComponent } from './order-qty-form/order-qty-form.component';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { OrderDetailViewComponent } from './pages';
import { OrderEffects } from './store/effects';
import { fromOrder } from './store/reducers';
import { FuseSidebarModule } from '@fuse/components';

@NgModule({
    declarations: [
        CalculateGrossPricePipe,
        CatalogueTypePipe,
        DeliveryStatusInfoComponent,
        DocumentOrderInfoComponent,
        OmsOrderLineComponent,
        OrderDetailComponent,
        OrderDetailViewComponent,
        OrderQtyFormComponent,
        OrdersComponent,
        OrderStatusInfoComponent,
        OrderStatusPipe,
        OrderLogPipe,
        OrderAddComponent,
        OrderStoreShipmentComponent,
        OrderListComponent,
    ],
    imports: [
        OrdersRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,
        FuseSidebarModule,

        QuillModule,
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxPermissionsModule.forChild(),

        ImportAdvancedModule,

        StoreModule.forFeature(fromOrder.FEATURE_KEY, fromOrder.reducer),
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        EffectsModule.forFeature([ExportsEffects, OrderEffects]),
    ],
    entryComponents: [OrderQtyFormComponent],
})
export class OrdersModule {}
