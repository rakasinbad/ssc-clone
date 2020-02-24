// Angular Core Libraries.
import { NgModule } from '@angular/core';

// Angular Routing Libraries
import { Routes, RouterModule } from '@angular/router';

// NgxPermissions Libraries.
import { NgxPermissionsGuard } from 'ngx-permissions';

// Auth Guard Core Libraries.
import { AuthGuard } from '../../core/auth/auth.guard';

// The component.
import { SkuAssignmentsComponent } from './sku-assignments.component';
import { SkuAssignmentFormComponent } from './sku-assignment-form';

// Routes
const routes: Routes = [
    {
        path: '',
        component: SkuAssignmentsComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SUPER_SUPPLIER_ADMIN'],
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
    { path: ':id', component: SkuAssignmentFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SkuAssignmentsRoutingModule {}