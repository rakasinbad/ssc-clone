import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

import { MaterialModule } from 'app/shared/material.module';
import { SharedModule } from 'app/shared/shared.module';

import { AssociationsRoutingModule } from './associations-routing.module';
import { AssociationsComponent } from './associations.component';
import { AssociationHeaderSearchComponent } from './components/header-search/association-header-search.component';
import { AssociationViewByComponent } from './components/view-by/association-view-by.component';
import { AssociationSalesRepComponent } from './components/sales-rep/association-sales-rep.component';
import { AssociationPortfolioComponent } from './components/portfolio/association-portfolio.component';
import { AssociationStoreComponent } from './components/store/association-store.component';
import { AssociationsFormComponent } from './pages/associations-form/associations-form.component';

import {
    featureKey as AssociationMainFeatureKey,
    reducers as AssociationMainReducers
} from './store/reducers';

import {
    featureKey as SalesRepMainFeatureKey,
    reducers as SalesRepMainReducers
} from '../sales-reps/store/reducers';

import { SalesRepEffects } from '../sales-reps/store/effects';
import {
    mainFeatureKey as PortfoliosMainFeatureKey,
    reducers as PortfolioReducers
} from '../portfolios/store/reducers';
import { PortfoliosEffects } from '../portfolios/store/effects/portfolios.effects';
import { AssociationsSelectedPortfoliosComponent } from './components/selected-portfolios/associations-selected-portfolios.component';
import { AssociationsFilterPortfoliosComponent } from './components/filter-portfolios/associations-filter-portfolios.component';
import { PortfolioStoresComponent } from './components/portfolio-stores/portfolio-stores.component';
import { StoreEffects } from '../portfolios/store/effects/stores.effects';
import { AssociationEffects, AssociationStoreEffects } from './store/effects';

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
        PortfolioStoresComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        RxReactiveFormsModule,
        AssociationsRoutingModule,
        MaterialModule,
        StoreModule.forFeature(AssociationMainFeatureKey, AssociationMainReducers),
        StoreModule.forFeature(PortfoliosMainFeatureKey, PortfolioReducers),
        StoreModule.forFeature(SalesRepMainFeatureKey, SalesRepMainReducers),
        EffectsModule.forFeature([
            AssociationEffects,
            AssociationStoreEffects,
            PortfoliosEffects,
            StoreEffects,
            SalesRepEffects
        ])
    ],
    entryComponents: [
        PortfolioStoresComponent
    ]
})
export class AssociationsModule {}
