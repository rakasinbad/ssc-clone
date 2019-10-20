import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { AccountDetailResolver } from './account-detail/account-detail.resolver';
import { AccountFormComponent } from './account-form/account-form.component';
import { AccountResolver } from './account-form/account.resolver';
import { AccountsComponent } from './accounts.component';

const routes: Routes = [
    {
        path: '',
        component: AccountsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'stores',
        loadChildren: () => import('./merchants/merchants.module').then(m => m.MerchantsModule),
        canLoad: [AuthGuard]
    },
    {
        path: 'internal',
        loadChildren: () => import('./internal/internal.module').then(m => m.InternalModule),
        canLoad: [AuthGuard]
    },
    {
        path: ':id',
        component: AccountFormComponent,
        canActivate: [AuthGuard],
        resolve: {
            account: AccountResolver
        }
    },
    {
        path: ':id/detail',
        component: AccountDetailComponent,
        canActivate: [AuthGuard],
        resolve: {
            account: AccountDetailResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountsRoutingModule {}
