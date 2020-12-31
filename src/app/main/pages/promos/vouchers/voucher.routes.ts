// Angular Core Libraries.
import { NgModule } from '@angular/core';

// Angular Routing Libraries
import { Routes, RouterModule } from '@angular/router';

// NgxPermissions Libraries.
import { NgxPermissionsGuard } from 'ngx-permissions';

// Auth Guard Core Libraries.
import { AuthGuard } from '../../core/auth/auth.guard';

// The component.
import { VoucherComponent } from './voucher.component';
import { VoucherFormComponent } from './pages/form/form.component';
import { VoucherDetailComponent } from './pages/detail/detail.component';
// import { SkuAssignmentDetailComponent } from './sku-assignment-detail';

import { getRoleByRouter } from 'app/shared/helpers';

// Routes
const routes: Routes = [
    {
        path: '',
        component: VoucherComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('promos', 'voucher'),
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
    {
        path: 'new',
        component: VoucherFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('promos', 'voucher'),
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },
            },
        },
        // resolve: {
        //     catalogues: CatalogueResolver,
        //     status: CatalogueStatusResolver
        // },
    },
    {
        path: 'view/:id',
        component: VoucherDetailComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: getRoleByRouter('promos', 'voucher'),
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
    // { path: ':id/edit', component: SkuAssignmentFormComponent },
    // { path: ':id/detail', component: SkuAssignmentDetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class VoucherRoutingModule {}
