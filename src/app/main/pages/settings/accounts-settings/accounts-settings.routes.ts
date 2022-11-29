import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../core/auth/auth.guard';
import { AccountsSettingsComponent } from './accounts-settings.component';
import { PasswordComponent } from './components/password/password.component';
import { SelfInformationComponent } from './components/self-information/self-information.component';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    {
        path: '',
        component: AccountsSettingsComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        children: [
            {
                path: 'information',
                component: SelfInformationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'password',
                component: PasswordComponent,
                canActivate: [AuthGuard]
            }
        ],
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
export class AccountsSettingsRoutingModule {}