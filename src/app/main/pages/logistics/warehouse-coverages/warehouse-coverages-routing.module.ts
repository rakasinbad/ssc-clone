import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WarehouseCoveragesFormComponent } from './pages/warehouse-coverages-form/warehouse-coverages-form.component';
import { WarehouseCoveragesComponent } from './warehouse-coverages.component';

const routes: Routes = [
    { path: '', component: WarehouseCoveragesComponent },
    { path: 'new', component: WarehouseCoveragesFormComponent },
    { path: ':id/detail', component: WarehouseCoveragesFormComponent },
    { path: ':id/edit', component: WarehouseCoveragesFormComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WarehouseCoveragesRoutingModule {}
