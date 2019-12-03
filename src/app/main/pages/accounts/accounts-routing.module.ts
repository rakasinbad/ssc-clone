import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'stores',
        pathMatch: 'full'
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
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountsRoutingModule {}
