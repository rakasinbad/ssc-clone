import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { CrossSellingPromoRoutingModule } from './cross-selling-promo.routes';
import { CrossSellingPromoComponent } from './cross-selling-promo.component';
import { CrossSellingPromoListComponent } from './components/cross-selling-promo-list/cross-selling-promo-list.component';
import { CrossSellingPromoDetailComponent } from './components/cross-selling-promo-detail/cross-selling-promo-detail.component';


@NgModule({
  declarations: [
    CrossSellingPromoComponent,
      CrossSellingPromoListComponent,
      CrossSellingPromoDetailComponent
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
  ]
})
export class CrossSellingPromoModule { }
