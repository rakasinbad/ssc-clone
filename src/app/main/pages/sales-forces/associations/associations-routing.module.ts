import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from '../../core/auth/auth.guard';

import { AssociationsComponent } from './associations.component';
import { AssociationsFormComponent } from './pages/associations-form/associations-form.component';

const routes: Routes = [
    {
        path: '',
        component: AssociationsComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SRM.ASC.READ'],
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
    {
        path: 'add',
        component: AssociationsFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SRM.ASC.CREATE'],
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
    // { path: ':id/edit', component: AssociationsFormComponent }
    // { path: ':id/detail', component: AssociationsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AssociationsRoutingModule {}
