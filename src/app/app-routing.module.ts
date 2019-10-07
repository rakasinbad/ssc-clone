import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './main/pages/core/auth/auth.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'pages',
        pathMatch: 'full'
    },
    {
        path: 'pages',
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./main/pages/dashboard/dashboard.module').then(m => m.DashboardModule),
                canLoad: [AuthGuard]
            },
            {
                path: 'accounts',
                loadChildren: () =>
                    import('./main/pages/accounts/accounts.module').then(m => m.AccountsModule),
                canLoad: [AuthGuard]
            },
            {
                path: 'attendances',
                loadChildren: () =>
                    import('./main/pages/attendances/attendances.module').then(
                        m => m.AttendancesModule
                    ),
                canLoad: [AuthGuard]
            },
            {
                path: 'orders',
                loadChildren: () =>
                    import('./main/pages/orders/orders.module').then(m => m.OrdersModule),
                canLoad: [AuthGuard]
            },
            {
                path: 'in-store-inventories',
                loadChildren: () =>
                    import('./main/pages/in-store-inventories/in-store-inventories.module').then(
                        m => m.InStoreInventoriesModule
                    ),
                canLoad: [AuthGuard]
            }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('./main/pages/core/auth/auth.module').then(m => m.AuthModule)
    }
];

/**
 *
 *
 * @export
 * @class AppRoutingModule
 */
@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
