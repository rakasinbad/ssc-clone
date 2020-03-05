import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { PortfoliosConflictStoresComponent } from './components/portfolios-conflict-stores/portfolios-conflict-stores.component';
import { PortfoliosFilterStoresComponent } from './components/portfolios-filter-stores/portfolios-filter-stores.component';
import { PortfoliosSelectedStoresComponent } from './components/portfolios-selected-stores/portfolios-selected-stores.component';
import { PortfolioDetailsComponent } from './pages/portfolio-details/portfolio-details.component';
import { PortfoliosFormComponent } from './pages/portfolios-form/portfolios-form.component';
import { PortfoliosStoreModule } from './portfolios-store.module';
import { PortfoliosComponent } from './portfolios.component';
import { PortfoliosRoutingModule } from './portfolios.routes';

// import { PortfolioCreateComponent } from './pages/portfolio-create/portfolio-create.component';

@NgModule({
    declarations: [
        PortfoliosComponent,
        PortfoliosFormComponent,
        PortfolioDetailsComponent,
        PortfoliosFilterStoresComponent,
        PortfoliosSelectedStoresComponent,
        PortfoliosConflictStoresComponent
        // PortfolioCreateComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentsModule,
        RxReactiveFormsModule,
        PortfoliosRoutingModule,
        PortfoliosStoreModule,
        MaterialModule,
        NgxPermissionsModule.forChild()
    ],
    entryComponents: [
        PortfoliosFilterStoresComponent,
        PortfoliosSelectedStoresComponent,
        PortfoliosConflictStoresComponent
    ]
})
export class PortfoliosModule {}
