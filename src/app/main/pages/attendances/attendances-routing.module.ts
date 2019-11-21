import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { AttendanceStoreDetailComponent } from './attendance-store-detail/attendance-store-detail.component';
// import { AttendanceStoreDetailResolver } from './attendance-store-detail/attendance-store-detail.resolver';
import { AttendanceEmployeeDetailComponent } from './attendance-employee-detail/attendance-employee-detail.component';
import { AttendanceEmployeeFormComponent } from './attendance-employee-form/attendance-employee-form.component';
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
        component: AttendanceStoreDetailComponent,
        canActivate: [AuthGuard]
    },
    {
        path: ':storeId/employee/:employeeId/detail',
        component: AttendanceEmployeeDetailComponent,
        canActivate: [AuthGuard]
    },
    {
        path: ':storeId/employee/:employeeId/edit',
        component: AttendanceEmployeeFormComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AttendancesRoutingModule {}
