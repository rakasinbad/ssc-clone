import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StockManagementDetailComponent } from './stock-management-detail';
import { StockManagementFormComponent } from './stock-management-form';
import { StockManagementsComponent } from './stock-managements.component';

const routes: Routes = [
    { path: '', component: StockManagementsComponent },
    { path: ':id/detail', component: StockManagementDetailComponent },
    { path: ':id', component: StockManagementFormComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StockManagementsRoutingModule {}
