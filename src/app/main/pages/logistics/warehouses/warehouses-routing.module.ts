import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WarehouseDetailComponent } from './warehouse-detail';
import { WarehouseFormComponent } from './warehouse-form';
import { WarehousesComponent } from './warehouses.component';

const routes: Routes = [
    { path: '', component: WarehousesComponent },
    { path: ':id/detail', component: WarehouseDetailComponent },
    { path: ':id', component: WarehouseFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WarehousesRoutingModule {}
