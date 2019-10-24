import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../core/auth/auth.guard';
import { PaymentStatusComponent } from './payment-status.component';
import { PaymentResolver, PaymentStatusResolver } from './resolvers';

const routes: Routes = [
    {
        path: '',
        component: PaymentStatusComponent,
        canActivate: [AuthGuard],
        resolve: { payment: PaymentResolver, status: PaymentStatusResolver }
    }
];

/**
 *
 *
 * @export
 * @class PaymentStatusRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PaymentStatusRoutingModule {}
