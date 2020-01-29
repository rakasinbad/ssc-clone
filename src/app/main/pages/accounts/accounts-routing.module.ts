import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { MerchantSettingComponent } from './merchants/merchant-setting/merchant-setting.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'stores',
        pathMatch: 'full'
    },
    {
        path: 'stores',
        loadChildren: () => import('./merchants/merchants.module').then(m => m.MerchantsModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [
                    'SUPER_SUPPLIER_ADMIN',
                    'FINANCE',
                    'HEAD_OF_SALES',
                    'BOS',
                    'COUNTRY_MANAGER',
                    'SUPPLIER_ADMIN'
                ],
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
        path: 'store-setting',
        loadChildren: () => import('./merchants/merchant-setting/merchant-setting.module').then(m => m.MerchantSettingModule),
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [
                    'SUPER_SUPPLIER_ADMIN',
                    'FINANCE',
                    'HEAD_OF_SALES',
                    'BOS',
                    'COUNTRY_MANAGER',
                    'SUPPLIER_ADMIN'
                ],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
        // resolve: {
        //     merchants: MerchantResolver
        // }
    },
    {
        path: 'internal',
        loadChildren: () => import('./internal/internal.module').then(m => m.InternalModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SUPER_SUPPLIER_ADMIN', 'SUPPLIER_ADMIN'],
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
export class AccountsRoutingModule {}
