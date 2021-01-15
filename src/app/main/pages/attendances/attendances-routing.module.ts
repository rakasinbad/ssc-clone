import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../core/auth/auth.guard';
import { AttendanceEmployeeDetailComponent } from './attendance-employee-detail/attendance-employee-detail.component';
import { AttendanceEmployeeFormComponent } from './attendance-employee-form/attendance-employee-form.component';
import { AttendanceFormComponent } from './attendance-form/attendance-form.component';
import { AttendanceResolver } from './attendance-form/attendance.resolver';
import { AttendanceStoreDetailComponent } from './attendance-store-detail/attendance-store-detail.component';
import { AttendancesComponent } from './attendances.component';
import { getRoleByRouter } from 'app/shared/helpers';

// import { AttendanceStoreDetailResolver } from './attendance-store-detail/attendance-store-detail.resolver';
const routes: Routes = [
    {
        path: '',
        component: AttendancesComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('attendances'),
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
    },
    {
        path: ':id',
        component: AttendanceFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('attendances'),
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        },
        resolve: {
            attendance: AttendanceResolver
        }
    },
    {
        path: ':id/detail',
        component: AttendanceStoreDetailComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('attendances', 'detail'),
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
    },
    {
        path: ':storeId/employee/:employeeId/detail',
        component: AttendanceEmployeeDetailComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('attendances', 'employee'),
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
    },
    {
        path: ':storeId/employee/:employeeId/activity/:activityId/edit',
        component: AttendanceEmployeeFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('attendances', 'employee'),
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AttendancesRoutingModule {}
