import { AgmCoreModule } from '@agm/core';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';

import { AttendanceDetailComponent } from './attendance-detail/attendance-detail.component';
import { AttendanceFormComponent } from './attendance-form/attendance-form.component';
import { AttendancesRoutingModule } from './attendances-routing.module';
import { AttendancesComponent } from './attendances.component';
import { AttendanceEffects } from './store/effects/attendance.effects';
import { fromAttendance } from './store/reducers';

/**
 *
 *
 * @export
 * @class AttendancesModule
 */
@NgModule({
    declarations: [AttendancesComponent, AttendanceFormComponent, AttendanceDetailComponent],
    imports: [
        AttendancesRoutingModule,

        SharedModule,
        MaterialModule,

        AgmCoreModule,
        RxReactiveFormsModule,

        StoreModule.forFeature(fromAttendance.FEATURE_KEY, fromAttendance.reducer),
        EffectsModule.forFeature([AttendanceEffects])
    ]
})
export class AttendancesModule {}
