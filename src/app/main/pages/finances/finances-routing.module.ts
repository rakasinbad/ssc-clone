import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../core/auth/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: 'credit-limit-balance', pathMatch: 'full' },
    {
        path: 'credit-limit-balance',
        loadChildren: () =>
            import('./credit-limit-balance/credit-limit-balance.module').then(
                m => m.CreditLimitBalanceModule
            ),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['FINANCE.CLB.SL.READ'],
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
    // {
    //     path: 'banks',
    //     loadChildren: () => import('./banks/banks.module').then(m => m.BanksModule),
    //     canLoad: [AuthGuard]
    // },
    {
        path: 'payment-status',
        loadChildren: () =>
            import('./payment-status/payment-status.module').then(m => m.PaymentStatusModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['FINANCE.PS.READ'],
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
        path: 'collection',
        loadChildren: () =>
            import('./collection/collection.module').then(m => m.CollectionModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['FINANCE.CL.READ'],
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

/**
 *
 *
 * @export
 * @class FinancesRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FinancesRoutingModule {}
