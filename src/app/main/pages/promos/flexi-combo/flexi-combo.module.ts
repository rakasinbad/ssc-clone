import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexiComboComponent } from './flexi-combo.component';
import { FlexiComboRoutingModule } from './flexi-combo.routes';
import { FlexiComboNgRxStoreModule } from './flexi-combo.ngrx.module';

import { SharedModule } from 'app/shared/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

import { NgxPermissionsModule } from 'ngx-permissions';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

//Component
import { FlexiComboListComponent } from './components/list/flexi-combo-list.component';
import { FlexiComboFormComponent } from './flexi-combo-form';

@NgModule({
    declarations: [FlexiComboComponent, FlexiComboListComponent, FlexiComboFormComponent],
    imports: [
        CommonModule,
        FlexiComboRoutingModule,
        FlexiComboNgRxStoreModule,

        SharedModule,
        MaterialModule,
        SharedComponentsModule,

        RxReactiveFormsModule,
        NgxPermissionsModule.forChild()
    ]
})
export class FlexiComboModule {}
