import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortfoliosRoutingModule } from './portfolios.routes';
import { PortfoliosComponent } from './portfolios.component';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { PortfoliosStoreModule } from './portfolios-store.module';
import { PortfolioDetailsComponent } from './pages/portfolio-details/portfolio-details.component';
import { PortfolioCreateComponent } from './pages/portfolio-create/portfolio-create.component';


@NgModule({
    declarations: [
        PortfoliosComponent,
        PortfolioCreateComponent,
        PortfolioDetailsComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        PortfoliosRoutingModule,
        PortfoliosStoreModule,
        MaterialModule,
    ]
})
export class PortfoliosModule { }
