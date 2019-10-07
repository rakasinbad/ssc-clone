import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { AttendanceDetailComponent } from './attendance-detail/attendance-detail.component';
import { AttendanceDetailResolver } from './attendance-detail/attendance-detail.resolver';
import { AttendanceFormComponent } from './attendance-form/attendance-form.component';
import { AttendanceResolver } from './attendance-form/attendance.resolver';
import { AttendancesComponent } from './attendances.component';

const routes: Routes = [
    {
        path: '',
        component: AttendancesComponent,
        canActivate: [AuthGuard]
    },
    {
        path: ':id',
        component: AttendanceFormComponent,
        canActivate: [AuthGuard],
        resolve: {
            attendance: AttendanceResolver
        }
    },
    {
        path: ':id/detail',
        component: AttendanceDetailComponent,
        canActivate: [AuthGuard],
        resolve: {
            attendance: AttendanceDetailResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AttendancesRoutingModule {}
