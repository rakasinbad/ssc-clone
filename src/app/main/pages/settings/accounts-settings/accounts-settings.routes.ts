import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/auth/auth.guard';
import { AccountsSettingsComponent } from './accounts-settings.component';
import { SelfInformationComponent } from './components/self-information/self-information.component';
import { PasswordComponent } from './components/password/password.component';

const routes: Routes = [
    {
        path: '',
        component: AccountsSettingsComponent,
        canActivate: [AuthGuard],
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
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountsSettingsRoutingModule {}
