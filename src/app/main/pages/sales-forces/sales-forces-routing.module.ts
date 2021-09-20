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
                only: ['SRM.SR.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
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
                only: ['SRM.PFO.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
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
                only: ['SRM.JP.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
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
                only: [],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
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
                only: [],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
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
                only: [],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
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
                only: ['SRM.PFO.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
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
                only: ['SRM.SR.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },    
            },
        },
    },
    {
        path: 'pjp',
        loadChildren: () => import('./pjp/pjp.module').then((m) => m.PjpModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },    
            },
        },
    },
    {
        path: 'journey-planssv2',
        loadChildren: () => import('./journey-plansv2/journey-plansv2.module').then((m) => m.JourneyPlanV2Module),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SRM.JP.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
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
                only: ['SRM.ASC.READ'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },    
            },
        },
    },
    {
        path: 'activity-setting',
        loadChildren: () =>
            import('./activity-setting/activity-setting.module').then((m) => m.ActivitySettingModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
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
