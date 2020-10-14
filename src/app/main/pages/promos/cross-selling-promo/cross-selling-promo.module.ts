import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CrossSellingPromoNgrxModule } from './store';

import { CrossSellingPromoRoutingModule } from './cross-selling-promo.routes';
import { CrossSellingPromoComponent } from './cross-selling-promo.component';
import { CrossSellingPromoListComponent } from './components/cross-selling-promo-list/cross-selling-promo-list.component';
import { CrossSellingPromoDetailComponent } from './components/cross-selling-promo-detail/cross-selling-promo-detail.component';
import { CrossSellingPromoFormComponent } from './components/cross-selling-promo-form/cross-selling-promo-form.component';
import { CrossSellingDetailGnComponent } from './components/cross-selling-promo-detail/cross-selling-detail-gn/cross-selling-detail-gn.component';
import { CrossSellingDetailCsgComponent } from './components/cross-selling-promo-detail/cross-selling-detail-csg/cross-selling-detail-csg.component';
import { CrossSellingDetailBsComponent } from './components/cross-selling-promo-detail/cross-selling-detail-bs/cross-selling-detail-bs.component';
import { CrossSellingDetailCsComponent } from './components/cross-selling-promo-detail/cross-selling-detail-cs/cross-selling-detail-cs.component';
import {
    CrossSellingPromoBenefitFormComponent,
    CrossSellingPromoGeneralInfoFormComponent,
    CrossSellingPromoGroupFormComponent,
    CrossSellingPromoSegmentSettingFormComponent,
} from './components/form';
import { CrossSellingPromoFormPageComponent } from './pages';
import { CrossSellingPromoFacadeService, CrossSellingPromoFormService } from './services';

@NgModule({
  declarations: [
      CrossSellingPromoComponent,
      CrossSellingPromoListComponent,
      CrossSellingPromoDetailComponent,
      CrossSellingPromoFormComponent,
      CrossSellingDetailGnComponent,
      CrossSellingDetailCsgComponent,
      CrossSellingDetailBsComponent,
      CrossSellingDetailCsComponent,
      CrossSellingPromoBenefitFormComponent,
      CrossSellingPromoFormPageComponent,
      CrossSellingPromoGeneralInfoFormComponent,
      CrossSellingPromoGroupFormComponent,
      CrossSellingPromoSegmentSettingFormComponent,
    ],
  imports: [
    CrossSellingPromoRoutingModule,
    
    SharedModule,
    SharedComponentsModule,
    MaterialModule,

    // Third Party (RxWeb: https://www.rxweb.io)
    RxReactiveFormsModule,
    RxReactiveDynamicFormsModule,

    // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
    NgxPermissionsModule.forChild(),

    //NgRx Store
    CrossSellingPromoNgrxModule
  ],
  providers: [CrossSellingPromoFacadeService, CrossSellingPromoFormService],
})
export class CrossSellingPromoModule { }
