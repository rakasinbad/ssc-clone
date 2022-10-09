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
import {
    CalculateGrossPricePipe,
    CatalogueTypePipe,
    OrderLogPipe,
    OrderStatusPipe,
} from 'app/shared/pipes';
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
    AddProductListComponent,
    OrderPreviewConfirmComponent,
    ImportProductsComponent,
    ModalConfirmationComponent
} from './components';
import { OrderQtyFormComponent } from './order-qty-form/order-qty-form.component';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { OrderDetailViewComponent } from './pages';
import {
    ImportProductsEffects,
    OrderEffects,
    ProductListEffects,
    OrderCheckoutEffects,
    PaymentValidationEffects,
    FetchAvailableSupplierStoresEffects,
    ImportProductsProgressEffects,
    ConfirmOrderPaymentEffects
} from './store/effects';
import { fromOrder, fromImportProducts, fromAddProduct, fromAvailableSupplierStore, fromImportProductsProgress, fromOrderCheckout, fromPaymentOption, fromConfirmOrderPayment } from './store/reducers';
import { FuseSidebarModule } from '@fuse/components';
import { OrderPreviewConfirmComponentGuard } from './components/order-add/order-preview-confirm/order-preview-confirm.guard';

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
        AddProductListComponent,
        ImportProductsComponent,
        OrderPreviewConfirmComponent,
        ModalConfirmationComponent
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
        StoreModule.forFeature(fromAddProduct.addProductFeatureKey, fromAddProduct.reducers),
        StoreModule.forFeature(fromExport.featureKey, fromExport.reducer),
        StoreModule.forFeature(fromImportProducts.FEATURE_KEY, fromImportProducts.reducer),
        StoreModule.forFeature(fromImportProductsProgress.FEATURE_KEY, fromImportProductsProgress.reducer),
        StoreModule.forFeature(fromAvailableSupplierStore.FEATURE_KEY, fromAvailableSupplierStore.reducers),
        StoreModule.forFeature(fromOrderCheckout.orderCheckoutFeatureKey, fromOrderCheckout.reducer),
        StoreModule.forFeature(fromPaymentOption.paymentOptionFeatureKey, fromPaymentOption.reducer),
        StoreModule.forFeature(fromConfirmOrderPayment.FEATURE_KEY, fromConfirmOrderPayment.reducer),
        EffectsModule.forFeature([
            ExportsEffects,
            OrderEffects,
            ImportProductsEffects,
            ProductListEffects,
            OrderCheckoutEffects,
            PaymentValidationEffects,
            FetchAvailableSupplierStoresEffects,
            ImportProductsProgressEffects,
            ConfirmOrderPaymentEffects
        ]),
    ],
    entryComponents: [OrderQtyFormComponent, AddProductListComponent, ImportProductsComponent, ModalConfirmationComponent],
    exports: [AddProductListComponent, ImportProductsComponent, ModalConfirmationComponent],
    providers: [
        OrderPreviewConfirmComponentGuard
    ]
})
export class OrdersModule {}
