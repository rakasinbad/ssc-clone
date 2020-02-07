import { AgmCoreModule } from '@agm/core';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';

import { AttendanceStoreDetailComponent } from './attendance-store-detail/attendance-store-detail.component';
import { AttendanceEmployeeDetailComponent } from './attendance-employee-detail/attendance-employee-detail.component';
import { AttendanceEmployeeFormComponent } from './attendance-employee-form/attendance-employee-form.component';
import { AttendanceFormComponent } from './attendance-form/attendance-form.component';
import { AttendancesRoutingModule } from './attendances-routing.module';
import { AttendancesComponent } from './attendances.component';

/** ATTENDANCE'S STATE MANAGEMENT */
import { AttendanceEffects } from './store/effects/attendance.effects';
import { fromAttendance } from './store/reducers';

/** MERCHANT'S STATE MANAGEMENT */
import { fromMerchant } from './store/reducers';
import { MerchantEffects } from './store/effects';

/** USER'S STATE MANAGEMENT */
import { fromUser } from './store/reducers';
import { UserEffects } from './store/effects';
import { NgxPermissionsModule } from 'ngx-permissions';
import { fromAuth } from '../core/auth/store/reducers';
import { AuthEffects } from '../core/auth/store/effects';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';

/**
 *
 *
 * @export
 * @class AttendancesModule
 */
@NgModule({
    declarations: [
        AttendancesComponent,
        AttendanceFormComponent,
        AttendanceStoreDetailComponent,
        AttendanceEmployeeFormComponent,
        AttendanceEmployeeDetailComponent
    ],
    imports: [
        AttendancesRoutingModule,

        SharedModule,
        SharedComponentsModule,
        MaterialModule,

        NgxPermissionsModule.forChild(),

        // AgmCoreModule,
        RxReactiveFormsModule,

        StoreModule.forFeature(fromAuth.FEATURE_KEY, fromAuth.reducer),
        StoreModule.forFeature(fromAttendance.FEATURE_KEY, fromAttendance.reducer),
        StoreModule.forFeature(fromMerchant.FEATURE_KEY, fromMerchant.reducer),
        StoreModule.forFeature(fromUser.FEATURE_KEY, fromUser.reducer),
        
        EffectsModule.forFeature([
            AttendanceEffects,
            AuthEffects,
            MerchantEffects,
            UserEffects
        ])
    ]
})
export class AttendancesModule {}
