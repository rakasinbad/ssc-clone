// Angular Core Libraries.
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from '../../core/auth/auth.guard';
import {CrossSellingPromoComponent} from './cross-selling-promo.component'
import { CrossSellingPromoDetailComponent } from './components/cross-selling-promo-detail/cross-selling-promo-detail.component';
import { CrossSellingPromoFormPageComponent } from './pages';

const routes: Routes = [
    {
        path: '',
        component: CrossSellingPromoComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SUPER_SUPPLIER_ADMIN'],
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
    { path: ':id/detail', component: CrossSellingPromoDetailComponent },
    {
        path: 'add',
        component: CrossSellingPromoFormPageComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['SUPER_SUPPLIER_ADMIN'],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true,
                    },
                },
            },
        },
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrossSellingPromoRoutingModule { }
