import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { PortfoliosRoutingModule } from './portfolios.routes';
import { PortfoliosComponent } from './portfolios.component';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { PortfoliosStoreModule } from './portfolios-store.module';
import { PortfoliosFormComponent } from './pages/portfolios-form/portfolios-form.component';
// import { PortfolioCreateComponent } from './pages/portfolio-create/portfolio-create.component';
// import { PortfolioDetailsComponent } from './pages/portfolio-details/portfolio-details.component';


@NgModule({
    declarations: [
        PortfoliosComponent,
        PortfoliosFormComponent,
        // PortfolioCreateComponent,
        // PortfolioDetailsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RxReactiveFormsModule,
        PortfoliosRoutingModule,
        PortfoliosStoreModule,
        MaterialModule,
    ]
})
export class PortfoliosModule { }