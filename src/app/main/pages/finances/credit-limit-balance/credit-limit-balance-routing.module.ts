import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/auth/auth.guard';
import { CreditLimitBalanceComponent } from './credit-limit-balance.component';
import { CreditLimitGroupComponent } from './credit-limit-group/credit-limit-group.component';
import { CreditStoresComponent } from './credit-stores/credit-stores.component';

const routes: Routes = [
    {
        path: '',
        component: CreditLimitBalanceComponent,
        canActivate: [AuthGuard],
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
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreditLimitBalanceRoutingModule {}
