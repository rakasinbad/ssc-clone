import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'warehouses',
        loadChildren: () => import('./warehouses/warehouses.module').then(m => m.WarehousesModule)
    },
    {
        path: 'warehouse-coverages',
        loadChildren: () =>
            import('./warehouse-coverages/warehouse-coverages.module').then(
                m => m.WarehouseCoveragesModule
            )
    },
    {
        path: 'sku-assignments',
        loadChildren: () =>
            import('./sku-assignments/sku-assignments.module').then(m => m.SkuAssignmentsModule)
    },
    {
        path: '',
        redirectTo: 'warehouses',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LogisticsRoutingModule {}
