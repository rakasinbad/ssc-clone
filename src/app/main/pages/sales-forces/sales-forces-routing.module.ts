import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'sales-rep', pathMatch: 'full' },
    {
        path: 'sales-rep',
        loadChildren: () => import('./sales-reps/sales-reps.module').then(m => m.SalesRepsModule)
    },
    {
        path: 'portfolio',
        loadChildren: () => import('./portfolios/portfolios.module').then(m => m.PortfoliosModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SalesForcesRoutingModule {}
