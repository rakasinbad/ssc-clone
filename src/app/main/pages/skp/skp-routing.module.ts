import { NgModule } from '@angular/core';
// Angular Routing Libraries
import { Routes, RouterModule } from '@angular/router';

// NgxPermissions Libraries.
import { NgxPermissionsGuard } from 'ngx-permissions';

// Auth Guard Core Libraries.
import { AuthGuard } from '../core/auth/auth.guard';

import { SkpComponent } from './skp.component';
import { SkpFormComponent } from './components/skp-form/skp-form.component';
import { SkpDetailComponent } from './components/skp-detail/skp-detail.component';
import { SkpModule } from './skp.module';
import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'list',
        component: SkpComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('skp', 'list'),
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
    },
    { path: ':id', component: SkpFormComponent },
    {
        
        path: 'detail/:id',
        component: SkpDetailComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('skp','detail'),
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
export class SkpRoutingModule { }
