// Angular Core Libraries.
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../core/auth/auth.guard';
import { FlexiComboDetailComponent } from './components/flexi-combo-detail';
import { FlexiComboFormComponent } from './flexi-combo-form';
import { FlexiComboComponent } from './flexi-combo.component';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    {
        path: '',
        component: FlexiComboComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('promos', 'flexi-combo'),
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },
            },
        },
    },
    { path: ':id/detail', component: FlexiComboDetailComponent },
    { path: ':id', component: FlexiComboFormComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FlexiComboRoutingModule {}
