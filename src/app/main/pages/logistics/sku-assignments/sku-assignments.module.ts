import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkuAssignmentsComponent } from './sku-assignments.component';
import { SkuAssignmentsRoutingModule } from './sku-assignments.routes';
import { SkuAssignmentsNgRxStoreModule } from './sku-assignments.ngrx.module';

import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

import { FindSkuComponent } from './components/find-sku/find-sku.component';
import { SkuAssignmentWarehouseComponent } from './components/warehouse/sku-assignment-warehouse.component';
import { SkuAssignmentSkuComponent } from './components/sku/sku-assignment-sku.component';
import { SkuAssignmentFormComponent } from './sku-assignment-form/sku-assignment-form.component';

import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

@NgModule({
    declarations: [
        SkuAssignmentsComponent,

        FindSkuComponent,
        SkuAssignmentFormComponent,
        SkuAssignmentWarehouseComponent,
        SkuAssignmentSkuComponent
    ],
    imports: [
        CommonModule,
        SkuAssignmentsRoutingModule,
        SkuAssignmentsNgRxStoreModule,

        SharedModule,
        MaterialModule,
        SharedComponentsModule,

        RxReactiveFormsModule,
        NgxPermissionsModule.forChild()
    ]
})
export class SkuAssignmentsModule {}
