import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../core/auth/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: 'flexi-combo', pathMatch: 'full' },
    {
        path: 'flexi-combo',
        loadChildren: () =>
            import('./flexi-combo/flexi-combo.module').then((m) => m.FlexiComboModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [
                    'SUPER_SUPPLIER_ADMIN',
                    'HEAD_OF_SALES',
                    'BOS',
                    'COUNTRY_MANAGER',
                    'SUPPLIER_ADMIN',
                ],
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
        path: 'period-target-promo',
        loadChildren: () =>
            import('./period-target-promo/period-target-promo.module').then(
                (m) => m.PeriodTargetPromoModule
            ),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [
                    'SUPER_SUPPLIER_ADMIN',
                    'HEAD_OF_SALES',
                    'BOS',
                    'COUNTRY_MANAGER',
                    'SUPPLIER_ADMIN',
                ],
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
        path: 'voucher',
        loadChildren: () => import('./vouchers/voucher.module').then((m) => m.VoucherModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [
                    'SUPER_SUPPLIER_ADMIN',
                    'HEAD_OF_SALES',
                    'BOS',
                    'COUNTRY_MANAGER',
                    'SUPPLIER_ADMIN',
                ],
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
export class PromosRoutingModule {}
