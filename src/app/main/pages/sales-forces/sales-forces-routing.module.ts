import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from '../core/auth/auth.guard';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    { path: '', redirectTo: 'sales-rep', pathMatch: 'full' },
    {
        path: 'sales-rep',
        loadChildren: () => import('./sales-reps/sales-reps.module').then((m) => m.SalesRepsModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'sales-rep'),
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
        path: 'portfolio',
        loadChildren: () =>
            import('./portfolios/portfolios.module').then((m) => m.PortfoliosModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'portfolio'),
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
        path: 'journey-plans',
        loadChildren: () =>
            import('./journey-plans/journey-plans.module').then((m) => m.JourneyPlansModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'journey-plans'),
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
        path: 'workday-setting',
        loadChildren: () =>
            import('./workday-setting/workday-setting.module').then((m) => m.WorkdaySettingModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'workday-setting'),
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
        path: 'sr-target',
        loadChildren: () => import('./sr-target/sr-target.module').then((m) => m.SrTargetModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'sr-target'),
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
        path: 'sales-team',
        loadChildren: () => import('./sales-team/sales-team.module').then((m) => m.SrTargetModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'sales-team'),
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
        path: 'portfoliosv2',
        loadChildren: () => import('./portfoliosv2/portfoliosv2.module').then((m) => m.SrTargetModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'portfoliosv2'),
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
        path: 'sales-repsv2',
        loadChildren: () => import('./sales-repsv2/sales-repsv2.module').then((m) => m.SrTargetModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'sales-repsv2'),
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
        path: 'associations',
        loadChildren: () =>
            import('./associations/associations.module').then((m) => m.AssociationsModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('sales-force', 'associations'),
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
    exports: [RouterModule],
})
export class SalesForcesRoutingModule {}
