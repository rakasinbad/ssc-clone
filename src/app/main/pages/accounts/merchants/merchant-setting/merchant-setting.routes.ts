import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../../core/auth/auth.guard';
import { MerchantSettingComponent } from './merchant-setting.component';

import { getRoleByRouter } from 'app/shared/helpers';

// import { MerchantSettingComponent } from './merchant-setting/merchant-setting.component';

const routes: Routes = [
    {
        path: '',
        component: MerchantSettingComponent,
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
