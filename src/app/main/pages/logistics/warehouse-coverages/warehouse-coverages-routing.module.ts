import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WarehouseCoverageFormComponent } from './warehouse-coverage-form';
import { WarehouseCoveragesComponent } from './warehouse-coverages.component';

const routes: Routes = [
    { path: '', component: WarehouseCoveragesComponent },
    { path: ':id', component: WarehouseCoverageFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WarehouseCoveragesRoutingModule {}
