import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'sales-rep', pathMatch: 'full' },
    {
        path: 'sales-rep',
        loadChildren: () => import('./sales-reps/sales-reps.module').then(m => m.SalesRepsModule)
    },
    { path: 'associations', loadChildren: () => import('./associations/associations.module').then(m => m.AssociationsModule) }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SalesForcesRoutingModule {}
