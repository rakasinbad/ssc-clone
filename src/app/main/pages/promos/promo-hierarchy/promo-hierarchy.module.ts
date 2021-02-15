import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoHierarchyRoutingModule } from './promo-hierarchy.routes';
// import { PromoHierarchyNgRxStoreModule } from './promo-hierarchy.ngrx.module';

import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { PromoHierarchyComponent } from './promo-hierarchy.component';
import { DetailPromoHierarchyComponent } from './components/detail-promo-hierarchy/detail-promo-hierarchy.component';
import { ListPromoHierarchyComponent } from './components/list-promo-hierarchy/list-promo-hierarchy.component';

// Component

@NgModule({
    declarations: [
        PromoHierarchyComponent,
        DetailPromoHierarchyComponent,
        ListPromoHierarchyComponent
    ],
    imports: [
        CommonModule,
        PromoHierarchyRoutingModule,
// PromoHierarchyNgRxStoreModule,

        SharedModule,
        MaterialModule,
        SharedComponentsModule,

        RxReactiveFormsModule,
        NgxPermissionsModule.forChild(),
    ],
})
export class PromoHierarchyModule {}
