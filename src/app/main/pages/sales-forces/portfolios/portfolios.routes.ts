import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PortfoliosComponent } from './portfolios.component';
import { PortfoliosFormComponent } from './pages/portfolios-form/portfolios-form.component';

const routes: Routes = [
    { path: '', component: PortfoliosComponent },
    { path: 'add', component: PortfoliosFormComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PortfoliosRoutingModule { }
