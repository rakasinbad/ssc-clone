import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: 'sales-rep', pathMatch: 'full' },
    {
        path: 'sales-rep',
        loadChildren: () => import('./sales-reps/sales-reps.module').then(m => m.SalesRepsModule),
        canLoad: [AuthGuard]
    },
    {
        path: 'portfolio',
        loadChildren: () => import('./portfolios/portfolios.module').then(m => m.PortfoliosModule),
        canLoad: [AuthGuard]
    },
    {
        path: 'journey-plans',
        loadChildren: () =>
            import('./journey-plans/journey-plans.module').then(m => m.JourneyPlansModule),
        canLoad: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SalesForcesRoutingModule {}
