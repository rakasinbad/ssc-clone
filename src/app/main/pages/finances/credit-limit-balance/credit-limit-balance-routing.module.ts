import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../core/auth/auth.guard';
import { CreditLimitBalanceComponent } from './credit-limit-balance.component';
import { CreditLimitGroupComponent } from './credit-limit-group/credit-limit-group.component';
import { CreditStoresComponent } from './credit-stores/credit-stores.component';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    {
        path: '',
        component: CreditLimitBalanceComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        children: [
            {
                path: 'stores',
                component: CreditStoresComponent,
                canActivate: [AuthGuard]
                // resolve: {
                //     stores: CreditLimitBalanceResolver
                // }
            },
            {
                path: 'group',
                component: CreditLimitGroupComponent,
                canActivate: [AuthGuard]
                // resolve: {
                //     stores: CreditLimitBalanceResolver
                // }
            }
        ],
        data: {
            permissions: {
                only: ['FINANCE.CLB.CLG.READ'],
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
export class CreditLimitBalanceRoutingModule {}
