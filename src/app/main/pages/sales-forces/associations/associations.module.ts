import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { SharedComponentsModule } from 'app/shared/components/shared-components.module';
import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { PortfoliosEffects } from '../portfolios/store/effects/portfolios.effects';
import { StoreEffects as PortfolioStoreEffects } from '../portfolios/store/effects/stores.effects';
import {
    mainFeatureKey as PortfoliosMainFeatureKey,
    reducers as PortfolioReducers
} from '../portfolios/store/reducers';
import { AssociationsRoutingModule } from './associations-routing.module';
import { AssociationsComponent } from './associations.component';
import { AssociationsFilterPortfoliosComponent } from './components/filter-portfolios/associations-filter-portfolios.component';
import { AssociationHeaderSearchComponent } from './components/header-search/association-header-search.component';
import { PortfolioStoresComponent } from './components/portfolio-stores/portfolio-stores.component';
import { AssociationPortfolioComponent } from './components/portfolio/association-portfolio.component';
import { AssociationSalesRepComponent } from './components/sales-rep/association-sales-rep.component';
import { AssociationsSelectedPortfoliosComponent } from './components/selected-portfolios/associations-selected-portfolios.component';
import { AssociationStoreComponent } from './components/store/association-store.component';
import { AssociationViewByComponent } from './components/view-by/association-view-by.component';
import { AssociationsFormComponent } from './pages/associations-form/associations-form.component';
import {
    AssociatedPortfoliosEffects,
    AssociatedStoresEffects,
    AssociationEffects,
    AssociationStoreEffects,
    SalesRepEffects,
    StoresEffects
} from './store/effects';
import {
    featureKey as AssociationMainFeatureKey,
    reducers as AssociationMainReducers
} from './store/reducers';

@NgModule({
    declarations: [
        AssociationsComponent,
        AssociationHeaderSearchComponent,
        AssociationViewByComponent,
        AssociationsFormComponent,
        // Main Component
        AssociationSalesRepComponent,
        AssociationPortfolioComponent,
        AssociationStoreComponent,
        // Sub-components
        AssociationsSelectedPortfoliosComponent,
        AssociationsFilterPortfoliosComponent,
        PortfolioStoresComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentsModule,
        RxReactiveFormsModule,
        AssociationsRoutingModule,
        MaterialModule,
        NgxPermissionsModule.forChild(),
        StoreModule.forFeature(AssociationMainFeatureKey, AssociationMainReducers),
        StoreModule.forFeature(PortfoliosMainFeatureKey, PortfolioReducers),
        // StoreModule.forFeature(SalesRepMainFeatureKey, SalesRepMainReducers),
        EffectsModule.forFeature([
            AssociationEffects,
            AssociationStoreEffects,
            AssociatedPortfoliosEffects,
            AssociatedStoresEffects,
            PortfoliosEffects,
            PortfolioStoreEffects,
            StoresEffects,
            SalesRepEffects
        ])
    ],
    entryComponents: [PortfolioStoresComponent]
})
export class AssociationsModule {}
