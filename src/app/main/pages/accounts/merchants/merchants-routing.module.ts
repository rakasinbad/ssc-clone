import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DropdownRolesResolver } from 'app/shared/resolvers';

import { AuthGuard } from '../../core/auth/auth.guard';
import { MerchantDetailComponent } from './merchant-detail/merchant-detail.component';
import { MerchantEmployeeDetailComponent } from './merchant-detail/merchant-employee-detail/merchant-employee-detail.component';
import { MerchantInfoDetailComponent } from './merchant-detail/merchant-info-detail/merchant-info-detail.component';
import { MerchantLocationDetailComponent } from './merchant-detail/merchant-location-detail/merchant-location-detail.component';
import { MerchantEmployeeComponent } from './merchant-employee/merchant-employee.component';
import { MerchantFormComponent } from './merchant-form/merchant-form.component';
import { MerchantsComponent } from './merchants.component';
import { MerchantEmployeeResolver, MerchantResolver } from './resolvers';

const routes: Routes = [
    {
        path: '',
        component: MerchantsComponent,
        canActivate: [AuthGuard]
        // resolve: {
        //     merchants: MerchantResolver
        // }
    },
    {
        path: ':id',
        component: MerchantFormComponent,
        canActivate: [AuthGuard]
    },
    {
        path: ':id/detail',
        component: MerchantDetailComponent,
        canActivate: [AuthGuard],
        children: [
            // {
            //     path: '',
            //     redirectTo: 'info',
            //     pathMatch: 'full'
            // },
            {
                path: 'info',
                component: MerchantInfoDetailComponent,
                canActivate: [AuthGuard],
                outlet: 'store-detail'
            },
            {
                path: 'employee',
                component: MerchantEmployeeDetailComponent,
                canActivate: [AuthGuard],
                outlet: 'store-detail',
                resolve: {
                    employees: MerchantEmployeeResolver
                }
            },
            {
                path: 'location',
                component: MerchantLocationDetailComponent,
                canActivate: [AuthGuard],
                outlet: 'store-detail'
            }
        ]
    },
    {
        path: ':id/employee',
        component: MerchantEmployeeComponent,
        canActivate: [AuthGuard],
        resolve: {
            roles: DropdownRolesResolver
        }
    }
];

/**
 *
 *
 * @export
 * @class MerchantsRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MerchantsRoutingModule {}
