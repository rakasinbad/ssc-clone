import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from '../core/auth/auth.guard';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    { path: '', redirectTo: 'manage', pathMatch: 'full' },
    {
        path: 'response',
        loadChildren: () =>
            import('./response/response.module').then((m) => m.ResponseModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('survey', 'response'),
            },
            redirectTo: {
                navigationCommands: ['/pages/errors/403'],
                navigationExtras: {
                    replaceUrl: true,
                    skipLocationChange: true,
                },
            },
        },
    },
    {
        path: 'manage',
        loadChildren: () => import('./manage/manage.module').then((m) => m.ManageModule),
        canLoad: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('survey', 'manage'),
            },
            redirectTo: {
                navigationCommands: ['/pages/errors/403'],
                navigationExtras: {
                    replaceUrl: true,
                    skipLocationChange: true,
                },
            },
        },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SurveyRoutingModule {}