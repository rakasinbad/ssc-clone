import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from '../../core/auth/auth.guard';

import { WarehouseCoveragesFormComponent } from './pages/warehouse-coverages-form/warehouse-coverages-form.component';
import { WarehouseCoveragesComponent } from './warehouse-coverages.component';

const routes: Routes = [
    {
        path: '',
        component: WarehouseCoveragesComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['WH.C.READ'],
            },
            redirectTo: {
                navigationCommands: ['/pages/errors/403'],
                navigationExtras: {
                    replaceUrl: true,
                    skipLocationChange: true,
                },
            },
        },
    },
    {
        path: 'new',
        component: WarehouseCoveragesFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['WH.C.CREATE'],
            },
            redirectTo: {
                navigationCommands: ['/pages/errors/403'],
                navigationExtras: {
                    replaceUrl: true,
                    skipLocationChange: true,
                },
            },
        },
    },
    {
        path: ':id/detail',
        component: WarehouseCoveragesFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['WH.C.READ'],
            },
            redirectTo: {
                navigationCommands: ['/pages/errors/403'],
                navigationExtras: {
                    replaceUrl: true,
                    skipLocationChange: true,
                },
            },
        },
    },
    {
        path: ':id/edit',
        component: WarehouseCoveragesFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['WH.C.UPDATE'],
            },
            redirectTo: {
                navigationCommands: ['/pages/errors/403'],
                navigationExtras: {
                    replaceUrl: true,
                    skipLocationChange: true,
                },
            },
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WarehouseCoveragesRoutingModule {}
