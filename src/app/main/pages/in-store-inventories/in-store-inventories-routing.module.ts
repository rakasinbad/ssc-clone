import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { InStoreInventoriesComponent } from './in-store-inventories.component';

const routes: Routes = [
    {
        path: '',
        component: InStoreInventoriesComponent,
        canActivate: [AuthGuard]
        // resolve: {
        //     merchants: MerchantResolver
        // }
    },
];

/**
 *
 *
 * @export
 * @class InStoreInventoriesRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InStoreInventoriesRoutingModule {}
