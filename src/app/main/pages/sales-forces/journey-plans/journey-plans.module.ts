import { NgModule } from '@angular/core';
import { RxReactiveDynamicFormsModule } from '@rxweb/reactive-dynamic-forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule, SharedModule } from 'app/shared';
import { NgxPermissionsModule } from 'ngx-permissions';

import { JourneyPlanFormComponent } from './journey-plan-form/journey-plan-form.component';
import { JourneyPlansRoutingModule } from './journey-plans-routing.module';
import { JourneyPlansComponent } from './journey-plans.component';

/**
 *
 *
 * @export
 * @class JourneyPlansModule
 */
@NgModule({
    declarations: [JourneyPlansComponent, JourneyPlanFormComponent],
    imports: [
        JourneyPlansRoutingModule,
        SharedModule,
        MaterialModule,

        // Third Party (RxWeb: https://www.rxweb.io)
        RxReactiveFormsModule,
        RxReactiveDynamicFormsModule,

        // Third Party (NgxPermissions: https://github.com/AlexKhymenko/ngx-permissions)
        NgxPermissionsModule.forChild()
    ]
})
export class JourneyPlansModule {}
