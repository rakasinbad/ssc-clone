import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoHierarchyRoutingModule } from './promo-hierarchy.routes';
import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { PromoHierarchyNgrxModule } from './store'
import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ApplyDialogModule } from 'app/shared/components/dialogs/apply-dialog/apply-dialog.module';

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
        PromoHierarchyNgrxModule,

        SharedModule,
        MaterialModule,
        SharedComponentsModule,

        RxReactiveFormsModule,
        ApplyDialogModule,
        NgxPermissionsModule.forChild(),
    ],
    exports: [
        SetPromoHierarchyComponent
    ],
    entryComponents: [
        SetPromoHierarchyComponent,
    ],
})
export class PromoHierarchyModule {}
