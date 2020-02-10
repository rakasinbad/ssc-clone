import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule, SharedModule, ImportAdvancedModule } from 'app/shared';
import { NgxPermissionsModule } from 'ngx-permissions';

import { ExportFilterComponent, JourneyPlanSelectedStoresComponent } from './components';
import {
    JourneyPlanActionComponent,
    JourneyPlanFormComponent,
    JourneyPlanInfoComponent,
    JourneyPlanStoreComponent
} from './journey-plan-form';
import { JourneyPlansRoutingModule } from './journey-plans-routing.module';
import { JourneyPlansStoreModule } from './journey-plans-store.module';
import { JourneyPlansComponent } from './journey-plans.component';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

/**
 *
 *
 * @export
 * @class JourneyPlansModule
 */
@NgModule({
    declarations: [
        ExportFilterComponent,
        JourneyPlanActionComponent,
        JourneyPlanFormComponent,
        JourneyPlanInfoComponent,
        JourneyPlansComponent,
        JourneyPlanSelectedStoresComponent,
        JourneyPlanStoreComponent
    ],
    imports: [
        JourneyPlansRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        ImportAdvancedModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild(),

        // Store
        JourneyPlansStoreModule
    ],
    entryComponents: [ExportFilterComponent]
})
export class JourneyPlansModule {}
