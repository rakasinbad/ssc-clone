import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PortfoliosComponent } from './portfolios.component';
import { PortfoliosFormComponent } from './pages/portfolios-form/portfolios-form.component';
import { PortfolioDetailsComponent } from './pages/portfolio-details/portfolio-details.component';

const routes: Routes = [
    { path: '', component: PortfoliosComponent },
    { path: 'add', component: PortfoliosFormComponent },
    { path: ':id/edit', component: PortfoliosFormComponent },
    { path: ':id/detail', component: PortfolioDetailsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PortfoliosRoutingModule { }
