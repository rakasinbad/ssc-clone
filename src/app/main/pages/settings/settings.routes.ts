import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../core/auth/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: 'accounts', pathMatch: 'full' },
    {
        path: 'accounts',
        loadChildren: () =>
            import('./accounts-settings/accounts-settings.module').then(
                m => m.AccountsSettingsModule
            ),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },    
            },
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingsRoutingModule {}
