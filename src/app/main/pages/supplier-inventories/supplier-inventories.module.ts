import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { NgxPermissionsModule } from 'ngx-permissions';

import { SupplierInventoryEffects } from './store/effects/supplier-inventory.effects';
import { fromSupplierInventory } from './store/reducers';
import { SupplierInventoriesRoutingModule } from './supplier-inventories-routing.module';
import { SupplierInventoriesComponent } from './supplier-inventories.component';
import { SupplierInventoryFormComponent } from './supplier-inventory-form/supplier-inventory-form.component';

@NgModule({
    declarations: [SupplierInventoriesComponent, SupplierInventoryFormComponent],
    imports: [
        SupplierInventoriesRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,
        NgxImageZoomModule.forRoot(),
        NgxPermissionsModule.forChild(),

        StoreModule.forFeature(fromSupplierInventory.FEATURE_KEY, fromSupplierInventory.reducer),
        EffectsModule.forFeature([SupplierInventoryEffects])
    ]
})
export class SupplierInventoriesModule {}
