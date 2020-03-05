import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../../core/auth/auth.guard';
import { MerchantSettingComponent } from './merchant-setting.component';

// import { MerchantSettingComponent } from './merchant-setting/merchant-setting.component';

const routes: Routes = [
    {
        path: '',
        component: MerchantSettingComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
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
        // resolve: {
        //     merchants: MerchantResolver
        // }
    }
];

/**
 *
 *
 * @export
 * @class MerchantsRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MerchantSettingRoutes {}
