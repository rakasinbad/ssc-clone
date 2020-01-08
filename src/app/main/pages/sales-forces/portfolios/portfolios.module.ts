import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { PortfoliosRoutingModule } from './portfolios.routes';
import { PortfoliosComponent } from './portfolios.component';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { PortfoliosStoreModule } from './portfolios-store.module';
import { PortfoliosFormComponent } from './pages/portfolios-form/portfolios-form.component';
import { PortfolioDetailsComponent } from './pages/portfolio-details/portfolio-details.component';
import { PortfoliosFilterStoresComponent } from './components/portfolios-filter-stores/portfolios-filter-stores.component';
import { PortfoliosSelectedStoresComponent } from './components/portfolios-selected-stores/portfolios-selected-stores.component';
import { PortfoliosConflictStoresComponent } from './components/portfolios-conflict-stores/portfolios-conflict-stores.component';
// import { PortfolioCreateComponent } from './pages/portfolio-create/portfolio-create.component';


@NgModule({
    declarations: [
        PortfoliosComponent,
        PortfoliosFormComponent,
        PortfolioDetailsComponent,
        PortfoliosFilterStoresComponent,
        PortfoliosSelectedStoresComponent,
        PortfoliosConflictStoresComponent,
        // PortfolioCreateComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        RxReactiveFormsModule,
        PortfoliosRoutingModule,
        PortfoliosStoreModule,
        MaterialModule,
    ],
    entryComponents: [
        PortfoliosFilterStoresComponent,
        PortfoliosSelectedStoresComponent,
        PortfoliosConflictStoresComponent,
    ]
})
export class PortfoliosModule { }
