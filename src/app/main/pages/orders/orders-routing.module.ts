import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrdersComponent } from './orders.component';
import { NgxPermissionsGuard } from 'ngx-permissions';

const routes: Routes = [
    {
        path: '',
        component: OrdersComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [
                    'SUPER_SUPPLIER_ADMIN',
                    'FINANCE',
                    'HEAD_OF_SALES',
                    'BOS',
                    'COUNTRY_MANAGER',
                    'SUPPLIER_ADMIN'
                ],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
        // resolve: {
        //     orders: OrderResolver,
        //     status: OrderStatusResolver
        // }
    },
    {
        path: ':id/detail',
        component: OrderDetailComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [
                    'SUPER_SUPPLIER_ADMIN',
                    'FINANCE',
                    'HEAD_OF_SALES',
                    'BOS',
                    'COUNTRY_MANAGER',
                    'SUPPLIER_ADMIN'
                ],
                redirectTo: {
                    navigationCommands: ['/pages/errors/403'],
                    navigationExtras: {
                        replaceUrl: true,
                        skipLocationChange: true
                    }
                }
            }
        }
        // resolve: {
        //     order: OrderDetailResolver
        // }
    }
];

/**
 *
 *
 * @export
 * @class OrdersRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrdersRoutingModule {}
