import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';

import { AuthGuard } from '../../core/auth/auth.guard';
import {
    MerchantDetailComponent,
    MerchantEmployeeDetailComponent,
    MerchantInfoDetailComponent,
    MerchantLocationDetailComponent
} from './merchant-detail';
import { MerchantEmployeeComponent } from './merchant-employee/merchant-employee.component';
import { MerchantFormComponent } from './merchant-form/merchant-form.component';
import { MerchantsComponent } from './merchants.component';
import { StoreDetailPageComponent } from './pages/detail/detail.component';
// import { MerchantSettingComponent } from './merchant-setting/merchant-setting.component';

import { getRoleByRouter } from 'app/shared/helpers';

const routes: Routes = [
    {
        path: '',
        component: MerchantsComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['ACCOUNT.STORE.READ'],
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
        //     merchants: MerchantResolver
        // }
    },
    {
        path: ':id',
        component: MerchantFormComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['ACCOUNT.STORE.CREATE', 'ACCOUNT.STORE.UPDATE'],
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
    {
        path: ':id/detail',
        component: StoreDetailPageComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
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
                outlet: 'store-detail'
                // resolve: {
                //     employees: MerchantEmployeeResolver
                // }
            },
            {
                path: 'location',
                component: MerchantLocationDetailComponent,
                canActivate: [AuthGuard],
                outlet: 'store-detail'
            }
        ],
        data: {
            permissions: {
                only: ['ACCOUNT.STORE.READ'],
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
    {
        path: ':supplierStoreId/:storeId/:id/employee',
        component: MerchantEmployeeComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['ACCOUNT.STORE.READ'],
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
        //     roles: DropdownRolesResolver
        // }
    },
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
