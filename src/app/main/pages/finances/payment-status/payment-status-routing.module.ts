import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../core/auth/auth.guard';
import { PaymentStatusComponent } from './payment-status.component';
import { PaymentStatusViewInvoicesComponent } from './payment-status-view-invoices/payment-status-view-invoices.component';

const routes: Routes = [
    {
        path: '',
        component: PaymentStatusComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [
                    'SUPER_SUPPLIER_ADMIN',
                    'FINANCE',
                    'HEAD_OF_SALES',
                    'BOS',
                    'COUNTRY_MANAGER'
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
        // resolve: { payment: PaymentResolver, status: PaymentStatusResolver }
    },
    {
        path: ':id/view-invoices',
        component: PaymentStatusViewInvoicesComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: [
                    'SUPER_SUPPLIER_ADMIN',
                    'FINANCE',
                    'HEAD_OF_SALES',
                    'BOS',
                    'COUNTRY_MANAGER'
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
