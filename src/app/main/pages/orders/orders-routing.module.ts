import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from '../core/auth/auth.guard';
import { OrdersComponent } from './orders.component';
import { OrderDetailViewComponent } from './pages';
import { OrderAddComponent } from "./components/order-add/order-add.component";
import { OrderPreviewConfirmComponent } from './components/order-add/order-preview-confirm/order-preview-confirm.component';
import { OrderPreviewConfirmComponentGuard } from './components/order-add/order-preview-confirm/order-preview-confirm.guard';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    {
        path: '',
        component: OrdersComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['OMS.READ'],
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
        path: ':id/detail',
        component: OrderDetailViewComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['OMS.READ'],
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
        path: 'add',
        component: OrderAddComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['OMS.READ'],
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
        path: 'add/preview',
        component: OrderPreviewConfirmComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        canDeactivate: [OrderPreviewConfirmComponentGuard],
        data: {
            permissions: {
                only: ['OMS.READ'],
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
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrdersRoutingModule {}
