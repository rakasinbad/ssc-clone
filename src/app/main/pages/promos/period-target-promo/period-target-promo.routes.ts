// Angular Core Libraries.
import { NgModule } from '@angular/core';

// Angular Routing Libraries
import { Routes, RouterModule } from '@angular/router';

// NgxPermissions Libraries.
import { NgxPermissionsGuard } from 'ngx-permissions';

// Auth Guard Core Libraries.
import { AuthGuard } from '../../core/auth/auth.guard';

// The component.
import { PeriodTargetPromoComponent } from './period-target-promo.component';
// import { SkuAssignmentDetailComponent } from './sku-assignment-detail';

// Routes
const routes: Routes = [
    {
        path: '',
        component: PeriodTargetPromoComponent,
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
    // { path: ':id/edit', component: SkuAssignmentFormComponent },
    // { path: ':id/detail', component: SkuAssignmentDetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PeriodTargetPromoRoutingModule {}
