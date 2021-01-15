import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { getRoleByRouter } from 'app/shared/helpers';

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
                only: getRoleByRouter('account', 'stores'),
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
        loadChildren: () =>
            import('./merchants/merchant-setting/merchant-setting.module').then(
                m => m.MerchantSettingModule
            ),
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('account', 'store-setting'),
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
        path: 'internal',
        loadChildren: () => import('./internal/internal.module').then(m => m.InternalModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('account', 'internal'),
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
        path: 'store-segmentation',
        loadChildren: () =>
            import('./merchant-segmentation/merchant-segmentation.module').then(
                m => m.MerchantSegmentationModule
            ),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('account', 'store-segmentation'),
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
