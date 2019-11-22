import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../core/auth/auth.guard';
import { SupplierInventoriesComponent } from './supplier-inventories.component';
import { SupplierInventoryFormComponent } from './supplier-inventory-form/supplier-inventory-form.component';

const routes: Routes = [
    { path: '', component: SupplierInventoriesComponent, canActivate: [AuthGuard] },
    {
        path: ':id',
        component: SupplierInventoryFormComponent,
        canActivate: [AuthGuard]
    }
];

/**
 *
 *
 * @export
 * @class SupplierInventoriesRoutingModule
 */
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SupplierInventoriesRoutingModule {}
