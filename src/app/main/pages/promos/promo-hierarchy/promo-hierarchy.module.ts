import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoHierarchyRoutingModule } from './promo-hierarchy.routes';
// import { PromoHierarchyNgRxStoreModule } from './promo-hierarchy.ngrx.module';

import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

// Component
import { PromoHierarchyComponent } from './promo-hierarchy.component';
import { DetailPromoHierarchyComponent } from './components/detail-promo-hierarchy/detail-promo-hierarchy.component';
import { ListPromoHierarchyComponent } from './components/list-promo-hierarchy/list-promo-hierarchy.component';
import { PromoInfomationComponent } from './components/detail-promo-hierarchy/promo-infomation/promo-infomation.component';
import { LayerInfomationComponent } from './components/detail-promo-hierarchy/layer-infomation/layer-infomation.component';
import { SetPromoHierarchyComponent } from './pages/set-promo-hierarchy/set-promo-hierarchy.component';

@NgModule({
    declarations: [
        PromoHierarchyComponent,
        DetailPromoHierarchyComponent,
        ListPromoHierarchyComponent,
        PromoInfomationComponent,
        LayerInfomationComponent,
        SetPromoHierarchyComponent
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
