import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import {
    FlexiComboDetailCnbComponent,
    FlexiComboDetailComponent,
    FlexiComboDetailCustomerComponent,
    FlexiComboDetailGeneralComponent,
    FlexiComboDetailTriggerComponent,
} from './components/flexi-combo-detail';
import { FlexiComboListComponent } from './components/flexi-combo-list';
import { FlexiComboFormComponent } from './flexi-combo-form';
import { FlexiComboComponent } from './flexi-combo.component';
import { FlexiComboRoutingModule } from './flexi-combo.routes';
import { FlexiComboNgrxModule } from './store';

@NgModule({
    declarations: [
        FlexiComboComponent,
        FlexiComboDetailCnbComponent,
        FlexiComboDetailCustomerComponent,
        FlexiComboDetailComponent,
        FlexiComboDetailGeneralComponent,
        FlexiComboDetailTriggerComponent,
        FlexiComboFormComponent,
        FlexiComboListComponent,
    ],
    imports: [
        FlexiComboRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild(),

        // Ngrx Store
        FlexiComboNgrxModule,
    ],
})
export class FlexiComboModule {}
