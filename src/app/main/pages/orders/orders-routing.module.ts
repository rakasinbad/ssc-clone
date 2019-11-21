import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrdersComponent } from './orders.component';

const routes: Routes = [
    {
        path: '',
        component: OrdersComponent,
        canActivate: [AuthGuard]
        // resolve: {
        //     orders: OrderResolver,
        //     status: OrderStatusResolver
        // }
    },
    {
        path: ':id/detail',
        component: OrderDetailComponent,
        canActivate: [AuthGuard]
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
