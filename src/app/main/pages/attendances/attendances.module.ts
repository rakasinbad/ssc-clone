import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { PipeSharedModule } from 'app/shared';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AuthEffects } from '../core/auth/store/effects';
import { fromAuth } from '../core/auth/store/reducers';
import { AttendanceEmployeeDetailComponent } from './attendance-employee-detail/attendance-employee-detail.component';
import { AttendanceEmployeeFormComponent } from './attendance-employee-form/attendance-employee-form.component';
import { AttendanceFormComponent } from './attendance-form/attendance-form.component';
import { AttendanceStoreDetailComponent } from './attendance-store-detail/attendance-store-detail.component';
import { AttendancesRoutingModule } from './attendances-routing.module';
import { AttendancesComponent } from './attendances.component';
import { MerchantEffects, UserEffects } from './store/effects';
import { AttendanceEffects } from './store/effects/attendance.effects';
import { fromAttendance, fromMerchant, fromUser } from './store/reducers';

@NgModule({
    declarations: [
        AttendancesComponent,
        AttendanceFormComponent,
        AttendanceStoreDetailComponent,
        AttendanceEmployeeFormComponent,
        AttendanceEmployeeDetailComponent,
    ],
    imports: [
        AttendancesRoutingModule,

        MaterialModule,
        PipeSharedModule,
        SharedComponentsModule,
        SharedModule,

        NgxPermissionsModule.forChild(),
        RxReactiveFormsModule,

        StoreModule.forFeature(fromAuth.FEATURE_KEY, fromAuth.reducer),
        StoreModule.forFeature(fromAttendance.FEATURE_KEY, fromAttendance.reducer),
        StoreModule.forFeature(fromMerchant.FEATURE_KEY, fromMerchant.reducer),
        StoreModule.forFeature(fromUser.FEATURE_KEY, fromUser.reducer),

        EffectsModule.forFeature([AttendanceEffects, AuthEffects, MerchantEffects, UserEffects]),
    ],
})
export class AttendancesModule {}
