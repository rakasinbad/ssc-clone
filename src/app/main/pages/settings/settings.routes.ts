import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: 'accounts', pathMatch: 'full' },
    {
        path: 'accounts',
        loadChildren: () =>
            import('./accounts-settings/accounts-settings.module').then(
                m => m.AccountsSettingsModule
            ),
        canLoad: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingsRoutingModule { }
