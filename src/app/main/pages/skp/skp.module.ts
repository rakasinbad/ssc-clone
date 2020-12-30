import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { AgmCoreModule } from '@agm/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SkpRoutingModule } from './skp-routing.module';
import { SkpComponent } from './skp.component';
import { SkpListComponent } from './components/skp-list/skp-list.component';
import { SkpCreateComponent } from './components/skp-create/skp-create.component';
import { SkpDetailComponent } from './components/skp-detail/skp-detail.component';

@NgModule({
    declarations: [
        SkpComponent, 
        SkpListComponent, SkpCreateComponent, SkpDetailComponent
    ],
    imports: [
        // CommonModule,
        SkpRoutingModule,
        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild(),

        // // Ngrx Store
        // FlexiComboNgrxModule,
        
        EffectsModule.forFeature([])
    ],
})
export class SkpModule {}
