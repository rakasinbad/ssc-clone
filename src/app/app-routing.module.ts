import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { getRoleByRouter } from 'app/shared/helpers';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from './main/pages/core/auth/auth.guard';
import { RoleGuard } from './main/pages/core/auth/role.guard';
// import { ReturnsModule } from './main/pages/returns/returns.module';
import { EmptyRouteComponent } from './empty-route/empty-route.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'pages',
        pathMatch: 'full',
    },
    {
        path: 'invoices',
        loadChildren: () =>
            import('./main/invoices/view-invoices/view-invoices.module').then(
                (m) => m.ViewInvoicesModule
            ),
    },
    {
        path: 'auth',
        loadChildren: () => import('./main/pages/core/auth/auth.module').then((m) => m.AuthModule),
    },
    {
        path: 'profile',
        loadChildren: () =>
            import('./main/pages/core/profile/profile.module').then((m) => m.ProfileModule),
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
        path: 'pages',
        children: [
            // {
            //     path: '',
            //     redirectTo: 'dashboard',
            //     pathMatch: 'full'
            // },
            // {
            //     path: 'dashboard',
            //     loadChildren: () =>
            //         import('./main/pages/dashboard/dashboard.module').then(
            //             (m) => m.DashboardModule
            //         ),
            //     canLoad: [AuthGuard],
            // },
            {
                path: 'account',
                loadChildren: () =>
                    import('./main/pages/accounts/accounts.module').then((m) => m.AccountsModule),
                canLoad: [AuthGuard],
                // data: {
                //     permissions: {
                //         only: getRoleByRouter('account'),
                //         redirectTo: {
                //             navigationCommands: ['/pages/errors/403'],
                //             navigationExtras: {
                //                 replaceUrl: true,
                //                 skipLocationChange: true,
                //             },
                //         },
                //     },
                // },
            },
            // {
            //     path: 'attendances',
            //     loadChildren: () =>
            //         import('./main/pages/attendances/attendances.module').then(
            //             (m) => m.AttendancesModule
            //         ),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('attendances'),
            //     //         redirectTo: {
            //     //             navigationCommands: ['/pages/errors/403'],
            //     //             navigationExtras: {
            //     //                 replaceUrl: true,
            //     //                 skipLocationChange: true,
            //     //             },
            //     //         },
            //     //     },
            //     // },
            // },
            // {
            //     path: 'finances',
            //     // children: [
            //     //     {
            //     //         path: '',
            //     //         redirectTo: 'credit-limit-balance',
            //     //         pathMatch: 'full'
            //     //     },
            //     //     {
            //     //         path: 'credit-limit-balance',
            //     //         loadChildren: () =>
            //     //             import(
            //     //                 './main/pages/finances/credit-limit-balance/credit-limit-balance.module'
            //     //             ).then(m => m.CreditLimitBalanceModule),
            //     //         canLoad: [AuthGuard]
            //     //     }
            //     // ]
            //     loadChildren: () =>
            //         import('./main/pages/finances/finances.module').then((m) => m.FinancesModule),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('finances'),
            //     //         redirectTo: {
            //     //             navigationCommands: ['/pages/errors/403'],
            //     //             navigationExtras: {
            //     //                 replaceUrl: true,
            //     //                 skipLocationChange: true,
            //     //             },
            //     //         },
            //     //     },
            //     // },
            // },
            {
                path: 'orders',
                loadChildren: () =>
                    import('./main/pages/orders/orders.module').then((m) => m.OrdersModule),
                canLoad: [AuthGuard],
                // data: {
                //     permissions: {
                //         only: getRoleByRouter('orders'),
                //         redirectTo: {
                //             navigationCommands: ['/pages/errors/403'],
                //             navigationExtras: {
                //                 replaceUrl: true,
                //                 skipLocationChange: true,
                //             },
                //         },
                //     },
                // },
            },
            {
                path: 'returns',
                loadChildren: () =>
                    import('./main/pages/returns/returns.module').then((m) => m.ReturnsModule),
                canLoad: [AuthGuard],
            },
            // {
            //     path: 'catalogues',
            //     loadChildren: () =>
            //         import('./main/pages/catalogues/catalogues.module').then(
            //             (m) => m.CataloguesModule
            //         ),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('catalogues'),
            //     //         redirectTo: {
            //     //             navigationCommands: ['/pages/errors/403'],
            //     //             navigationExtras: {
            //     //                 replaceUrl: true,
            //     //                 skipLocationChange: true,
            //     //             },
            //     //         },
            //     //     },
            //     // },
            // },
            // {
            //     path: 'in-store-inventories',
            //     loadChildren: () =>
            //         import('./main/pages/in-store-inventories/in-store-inventories.module').then(
            //             (m) => m.InStoreInventoriesModule
            //         ),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('in-store-inventories'),
            //     //         redirectTo: {
            //     //             navigationCommands: ['/pages/errors/403'],
            //     //             navigationExtras: {
            //     //                 replaceUrl: true,
            //     //                 skipLocationChange: true,
            //     //             },
            //     //         },
            //     //     },
            //     // },
            // },
            // {
                // path: 'sales-force',
                // loadChildren: () =>
                //     import('./main/pages/sales-forces/sales-forces.module').then(
                //         (m) => m.SalesForcesModule
                //     ),
                // canLoad: [AuthGuard],
                // data: {
                //     permissions: {
                //         only: getRoleByRouter('sales-force'),
                //     },
                //     redirectTo: {
                //         navigationCommands: ['/pages/errors/403'],
                //         navigationExtras: {
                //             replaceUrl: true,
                //             skipLocationChange: true,
                //         },
                //     },
                // },
            // },
            // {
            //     path: 'supplier-inventories',
            //     loadChildren: () =>
            //         import('./main/pages/supplier-inventories/supplier-inventories.module').then(
            //             (m) => m.SupplierInventoriesModule
            //         ),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('supplier-inventories'),
            //     //     },
            //     //     redirectTo: {
            //     //         navigationCommands: ['/pages/errors/403'],
            //     //         navigationExtras: {
            //     //             replaceUrl: true,
            //     //             skipLocationChange: true,
            //     //         },
            //     //     },
            //     // },
            // },
            // {
            //     path: 'settings',
            //     loadChildren: () =>
            //         import('./main/pages/settings/settings.module').then((m) => m.SettingsModule),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('settings'),
            //     //     },
            //     //     redirectTo: {
            //     //         navigationCommands: ['/pages/errors/403'],
            //     //         navigationExtras: {
            //     //             replaceUrl: true,
            //     //             skipLocationChange: true,
            //     //         },
            //     //     },
            //     // },
            // },
            {
                path: 'errors',
                loadChildren: () =>
                    import('./main/pages/core/errors/errors.module').then((m) => m.ErrorsModule),
                canLoad: [AuthGuard],
            },
            // {
                // path: 'logistics',
                // loadChildren: () =>
                //     import('./main/pages/logistics/logistics.module').then(
                //         (m) => m.LogisticsModule
                //     ),
                // canLoad: [AuthGuard],
            // },
            // {
            //     path: 'promos',
            //     loadChildren: () =>
            //         import('./main/pages/promos/promos.module').then((m) => m.PromosModule),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('promos'),
            //     //     },
            //     //     redirectTo: {
            //     //         navigationCommands: ['/pages/errors/403'],
            //     //         navigationExtras: {
            //     //             replaceUrl: true,
            //     //             skipLocationChange: true,
            //     //         },
            //     //     },
            //     // },
            // },
            // {
            //     path: 'catalogue-segmentations',
            //     loadChildren: () =>
            //         import(
            //             './main/pages/catalogue-segmentation/catalogue-segmentation.module'
            //         ).then((m) => m.CatalogueSegmentationModule),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('catalogue-segmentations'),
            //     //     },
            //     //     redirectTo: {
            //     //         navigationCommands: ['/pages/errors/403'],
            //     //         navigationExtras: {
            //     //             replaceUrl: true,
            //     //             skipLocationChange: true,
            //     //         },
            //     //     },
            //     // },
            // },
            // {
            //     path: 'survey',
            //     loadChildren: () =>
            //         import('./main/pages/survey/survey.module').then((m) => m.SurveyModule),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('survey'),
            //     //     },
            //     //     redirectTo: {
            //     //         navigationCommands: ['/pages/errors/403'],
            //     //         navigationExtras: {
            //     //             replaceUrl: true,
            //     //             skipLocationChange: true,
            //     //         },
            //     //     },
            //     // },
            // },
            // {
            //     path: 'quest',
            //     loadChildren: () =>
            //         import('./main/pages/quest/quest.module').then((m) => m.QuestModule),
            //     canLoad: [AuthGuard, NgxPermissionsGuard],
            //     data: {
            //         permissions: {
            //             only: getRoleByRouter('survey'),
            //         },
            //         redirectTo: {
            //             navigationCommands: ['/pages/errors/403'],
            //             navigationExtras: {
            //                 replaceUrl: true,
            //                 skipLocationChange: true,
            //             },
            //         },
            //     },
            // },
            // {
            //     path: 'skp',
            //     loadChildren: () => import('./main/pages/skp/skp.module').then((m) => m.SkpModule),
            //     canLoad: [AuthGuard],
            //     // data: {
            //     //     permissions: {
            //     //         only: getRoleByRouter('skp'),
            //     //         redirectTo: {
            //     //             navigationCommands: ['/pages/errors/403'],
            //     //             navigationExtras: {
            //     //                 replaceUrl: true,
            //     //                 skipLocationChange: true,
            //     //             },
            //     //         },
            //     //     },
            //     // }
            // },
            {
                path: 'landing',
                canActivate: [AuthGuard, RoleGuard],
                children: [],
            },
            {
                path: '',
                redirectTo: 'landing',
                pathMatch: 'full',
            },
        ],
    },
    {
        path: '**',
        component: EmptyRouteComponent
        // loadChildren: () =>
        //     import('./main/pages/core/errors/errors.module').then((m) => m.ErrorsModule),
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })],
    exports: [RouterModule],
    providers: [
        /*
         * Should be same as mount in root, but have strange effects when navigate between apps.
         * https://single-spa.js.org/docs/ecosystem-angular#configure-routes
         */
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
})
export class AppRoutingModule {}
