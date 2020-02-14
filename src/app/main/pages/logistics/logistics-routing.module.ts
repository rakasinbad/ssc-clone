import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'warehouses',
        loadChildren: () => import('./warehouses/warehouses.module').then(m => m.WarehousesModule)
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
